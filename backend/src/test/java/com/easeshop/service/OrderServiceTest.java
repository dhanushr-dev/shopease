package com.easeshop.service;

import com.easeshop.dto.request.OrderRequest;
import com.easeshop.dto.response.OrderResponse;
import com.easeshop.entity.*;
import com.easeshop.exception.BadRequestException;
import com.easeshop.repository.*;
import com.easeshop.service.impl.OrderServiceImpl;
import com.easeshop.util.DtoMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private UserRepository userRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private ProductRepository productRepository;
    @Mock private OrderStatusHistoryRepository statusHistoryRepository;
    @Mock private DtoMapper mapper;
    @Mock private com.easeshop.service.EmailService emailService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User user;
    private Cart cart;
    private Product product;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .build();

        product = Product.builder()
                .id(100L)
                .name("Jeans")
                .price(BigDecimal.valueOf(1000))
                .stock(10)
                .build();

        cartItem = CartItem.builder()
                .id(10L)
                .product(product)
                .quantity(2)
                .build();

        List<CartItem> items = new ArrayList<>();
        items.add(cartItem);

        cart = Cart.builder()
                .id(5L)
                .user(user)
                .items(items)
                .build();
    }

    @Test
    void placeOrderWithCOD_shouldCreatePendingOrder() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(Optional.empty());

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(10L);
            return o;
        });
        when(statusHistoryRepository.save(any(OrderStatusHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        OrderResponse mockResponse = OrderResponse.builder()
                .orderNumber("SE-123456")
                .totalAmount(BigDecimal.valueOf(2000))
                .status("PENDING")
                .paymentStatus("PENDING")
                .paymentMethod("COD")
                .build();
        when(mapper.toOrderResponse(any(Order.class))).thenReturn(mockResponse);

        OrderRequest request = OrderRequest.builder()
                .paymentMethod("COD")
                .build();

        OrderResponse response = orderService.placeOrder("john@example.com", request);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("COD", response.getPaymentMethod());
        verify(emailService, times(1)).sendOrderConfirmationEmail(any(Order.class));
    }

    @Test
    void placeOrderWithOnlinePayment_shouldNotMarkPaidAutomatically() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(Optional.empty());

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(10L);
            return o;
        });
        when(statusHistoryRepository.save(any(OrderStatusHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        OrderResponse mockResponse = OrderResponse.builder()
                .orderNumber("SE-123456")
                .totalAmount(BigDecimal.valueOf(2000))
                .status("PENDING")
                .paymentStatus("PAYMENT_PENDING")
                .paymentMethod("ONLINE")
                .build();
        when(mapper.toOrderResponse(any(Order.class))).thenReturn(mockResponse);

        OrderRequest request = OrderRequest.builder()
                .paymentMethod("ONLINE")
                .build();

        OrderResponse response = orderService.placeOrder("john@example.com", request);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals("PAYMENT_PENDING", response.getPaymentStatus());
        assertEquals("ONLINE", response.getPaymentMethod());
        verify(emailService, never()).sendOrderConfirmationEmail(any(Order.class));
    }

    @Test
    void placeOrderWithInsufficientStock_shouldThrowException() {
        cartItem.setQuantity(12);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        OrderRequest request = OrderRequest.builder()
                .paymentMethod("COD")
                .build();

        assertThrows(BadRequestException.class, () -> orderService.placeOrder("john@example.com", request));
        assertEquals(10, product.getStock());
    }

    @Test
    void placeOrder_shouldReduceStockSafely() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(Optional.empty());

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(statusHistoryRepository.save(any(OrderStatusHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        OrderResponse mockResponse = OrderResponse.builder()
                .orderNumber("SE-123456")
                .totalAmount(BigDecimal.valueOf(2000))
                .build();
        when(mapper.toOrderResponse(any(Order.class))).thenReturn(mockResponse);

        OrderRequest request = OrderRequest.builder()
                .paymentMethod("COD")
                .build();

        orderService.placeOrder("john@example.com", request);

        assertEquals(8, product.getStock());
        assertTrue(cart.getItems().isEmpty());
    }
}
