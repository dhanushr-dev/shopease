package com.easeshop.service.impl;

import com.easeshop.dto.request.OrderRequest;
import com.easeshop.dto.request.OrderStatusRequest;
import com.easeshop.dto.response.OrderResponse;
import com.easeshop.entity.*;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.*;
import com.easeshop.service.OrderService;
import com.easeshop.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final DtoMapper mapper;

    @Override
    @Transactional
    public OrderResponse placeOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty. Add items before placing an order.");
        }

        // Resolve shipping address
        Address shippingAddress = null;
        if (request != null && request.getAddressId() != null) {
            shippingAddress = addressRepository.findByIdAndUserId(request.getAddressId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));
        } else {
            shippingAddress = addressRepository.findByUserIdAndIsDefaultTrue(user.getId()).orElse(null);
        }

        // Create order
        String orderNumber = "SE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String paymentMethod = (request != null && request.getPaymentMethod() != null) ? request.getPaymentMethod().toUpperCase() : "COD";
        String paymentStatus = "ONLINE".equals(paymentMethod) ? "PAID" : "PENDING";

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .shippingAddress(shippingAddress)
                .status(OrderStatus.PENDING)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .notes(request != null ? request.getNotes() : null)
                .build();

        // Create order items from cart items and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName() +
                        ". Available: " + product.getStock());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .productName(product.getName())
                    .productImageUrl(product.getImageUrl())
                    .selectedVariant(cartItem.getSelectedVariant())
                    .build();

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            // Reduce stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        // Record initial status history
        statusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order).status(OrderStatus.PENDING).message("Order placed successfully").build());

        // Clear cart after order
        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("✅ Order placed: {} (Total: ₹{}) by {}", orderNumber, totalAmount, email);
        return mapper.toOrderResponse(order);
    }

    @Override
    public List<OrderResponse> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(mapper::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(String email, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        // Verify ownership (unless admin - handled at controller level)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This order does not belong to you");
        }
        return mapper.toOrderResponse(order);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(mapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + request.getStatus());
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.CONFIRMED) {
            order.setPaymentStatus("PAID");
        }
        order = orderRepository.save(order);

        // Record status history
        statusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order).status(newStatus)
                .message(request.getMessage() != null ? request.getMessage() : "Status updated to " + newStatus.name())
                .build());

        log.info("✅ Order {} status updated to: {}", order.getOrderNumber(), newStatus);
        return mapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public com.easeshop.dto.response.OrderCancelResponse cancelOrder(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This order does not belong to you");
        }

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == OrderStatus.SHIPPED || oldStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException("This order cannot be cancelled now.");
        }
        if (oldStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled.");
        }

        BigDecimal cancellationFee = BigDecimal.ZERO;
        BigDecimal refundAmount = BigDecimal.ZERO;
        String message = "Order cancelled successfully.";

        if (oldStatus == OrderStatus.CONFIRMED) {
            BigDecimal fee = order.getTotalAmount().multiply(new BigDecimal("0.05"));
            if (fee.compareTo(new BigDecimal("50")) < 0) {
                fee = new BigDecimal("50");
            }
            if (fee.compareTo(order.getTotalAmount()) > 0) {
                fee = order.getTotalAmount();
            }
            cancellationFee = fee;
            message = "Order cancelled. Cancellation fee applied.";
        }

        if ("PAID".equals(order.getPaymentStatus())) {
            refundAmount = order.getTotalAmount().subtract(cancellationFee);
            order.setPaymentStatus("REFUNDED");
        } else {
            order.setPaymentStatus("CANCELLED");
        }

        order.setStatus(OrderStatus.CANCELLED);
        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
        
        orderRepository.save(order);

        return com.easeshop.dto.response.OrderCancelResponse.builder()
                .orderId(orderId)
                .oldStatus(oldStatus.name())
                .newStatus(OrderStatus.CANCELLED.name())
                .cancellationFee(cancellationFee)
                .refundAmount(refundAmount)
                .message(message)
                .build();
    }

    @Override
    public List<Map<String, Object>> getOrderTracking(Long orderId) {
        List<OrderStatusHistory> history = statusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        if (history.isEmpty()) {
            // Fallback: generate from order itself
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
            Map<String, Object> entry = new HashMap<>();
            entry.put("status", order.getStatus().name());
            entry.put("message", "Order " + order.getStatus().name().toLowerCase().replace('_', ' '));
            entry.put("timestamp", order.getCreatedAt());
            return List.of(entry);
        }
        return history.stream().map(h -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("status", h.getStatus().name());
            entry.put("message", h.getMessage());
            entry.put("timestamp", h.getCreatedAt());
            return entry;
        }).collect(Collectors.toList());
    }
}
