package com.easeshop.service.impl;

import com.easeshop.dto.request.ReturnOrReplaceRequest;
import com.easeshop.dto.response.RefundResponse;
import com.easeshop.dto.response.ReplacementRequestResponse;
import com.easeshop.dto.response.ReturnRequestResponse;
import com.easeshop.entity.*;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.*;
import com.easeshop.service.ReturnReplaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnReplaceServiceImpl implements ReturnReplaceService {

    private final ReturnRequestRepository returnRepo;
    private final ReplacementRequestRepository replacementRepo;
    private final RefundRepository refundRepo;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ReturnRequestResponse createReturnRequest(String email, Long orderId, ReturnOrReplaceRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(user.getId())) throw new BadRequestException("Not your order");
        if (order.getStatus() != OrderStatus.DELIVERED) throw new BadRequestException("Order must be delivered to return");
        if (order.getUpdatedAt() != null && order.getUpdatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Return window of 7 days has expired");
        }
        
        if (returnRepo.findByOrderId(orderId).isPresent()) throw new BadRequestException("Return already requested");
        if (replacementRepo.findByOrderId(orderId).isPresent()) throw new BadRequestException("Replacement already requested");

        ReturnRequest returnReq = ReturnRequest.builder()
                .orderId(orderId)
                .userId(user.getId())
                .reason(request.getReason())
                .comments(request.getComments())
                .status("REQUESTED")
                .build();
        returnReq = returnRepo.save(returnReq);
        return toReturnResponse(returnReq, order.getOrderNumber());
    }

    @Override
    @Transactional
    public ReplacementRequestResponse createReplacementRequest(String email, Long orderId, ReturnOrReplaceRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(user.getId())) throw new BadRequestException("Not your order");
        if (order.getStatus() != OrderStatus.DELIVERED) throw new BadRequestException("Order must be delivered to replace");
        if (order.getUpdatedAt() != null && order.getUpdatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Replacement window of 7 days has expired");
        }

        if (returnRepo.findByOrderId(orderId).isPresent()) throw new BadRequestException("Return already requested");
        if (replacementRepo.findByOrderId(orderId).isPresent()) throw new BadRequestException("Replacement already requested");

        ReplacementRequest replReq = ReplacementRequest.builder()
                .orderId(orderId)
                .userId(user.getId())
                .reason(request.getReason())
                .comments(request.getComments())
                .status("REQUESTED")
                .build();
        replReq = replacementRepo.save(replReq);
        return toReplacementResponse(replReq, order.getOrderNumber());
    }

    private ReturnRequestResponse toReturnResponse(ReturnRequest req, String orderNumber) {
        return ReturnRequestResponse.builder().id(req.getId()).orderId(req.getOrderId()).orderNumber(orderNumber)
                .reason(req.getReason()).comments(req.getComments()).status(req.getStatus())
                .requestedAt(req.getRequestedAt()).approvedAt(req.getApprovedAt()).rejectedAt(req.getRejectedAt()).build();
    }
    private ReplacementRequestResponse toReplacementResponse(ReplacementRequest req, String orderNumber) {
        return ReplacementRequestResponse.builder().id(req.getId()).orderId(req.getOrderId()).orderNumber(orderNumber)
                .reason(req.getReason()).comments(req.getComments()).status(req.getStatus())
                .requestedAt(req.getRequestedAt()).approvedAt(req.getApprovedAt()).rejectedAt(req.getRejectedAt()).build();
    }
    private RefundResponse toRefundResponse(Refund req, String orderNumber) {
        return RefundResponse.builder().id(req.getId()).orderId(req.getOrderId()).orderNumber(orderNumber)
                .refundAmount(req.getRefundAmount()).refundReason(req.getRefundReason()).refundStatus(req.getRefundStatus())
                .paymentMethod(req.getPaymentMethod()).createdAt(req.getCreatedAt()).completedAt(req.getCompletedAt()).build();
    }

    @Override
    public List<ReturnRequestResponse> getUserReturns(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return returnRepo.findByUserIdOrderByRequestedAtDesc(user.getId()).stream()
                .map(r -> toReturnResponse(r, orderRepository.findById(r.getOrderId()).map(Order::getOrderNumber).orElse(""))).collect(Collectors.toList());
    }

    @Override
    public List<ReplacementRequestResponse> getUserReplacements(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return replacementRepo.findByUserIdOrderByRequestedAtDesc(user.getId()).stream()
                .map(r -> toReplacementResponse(r, orderRepository.findById(r.getOrderId()).map(Order::getOrderNumber).orElse(""))).collect(Collectors.toList());
    }

    @Override
    public List<RefundResponse> getUserRefunds(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return refundRepo.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> toRefundResponse(r, orderRepository.findById(r.getOrderId()).map(Order::getOrderNumber).orElse(""))).collect(Collectors.toList());
    }

    @Override
    public RefundResponse getRefundByOrderId(String email, Long orderId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Refund refund = refundRepo.findByOrderId(orderId).orElseThrow(() -> new ResourceNotFoundException("Refund", "orderId", orderId));
        if (!refund.getUserId().equals(user.getId())) throw new BadRequestException("Not your refund");
        return toRefundResponse(refund, orderRepository.findById(orderId).map(Order::getOrderNumber).orElse(""));
    }

    @Override
    public List<ReturnRequestResponse> getAllReturns() {
        return returnRepo.findAllByOrderByRequestedAtDesc().stream()
                .map(r -> toReturnResponse(r, orderRepository.findById(r.getOrderId()).map(Order::getOrderNumber).orElse(""))).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReturnRequestResponse approveReturn(Long returnId) {
        ReturnRequest req = returnRepo.findById(returnId).orElseThrow();
        if (!"REQUESTED".equals(req.getStatus())) throw new BadRequestException("Not in REQUESTED state");
        req.setStatus("APPROVED");
        req.setApprovedAt(LocalDateTime.now());
        
        Order order = orderRepository.findById(req.getOrderId()).orElseThrow();
        
        Refund refund = Refund.builder()
                .orderId(req.getOrderId())
                .userId(req.getUserId())
                .paymentMethod(order.getPaymentMethod())
                .refundReason("Return Approved")
                .build();
        
        if ("COD".equals(order.getPaymentMethod()) && "PENDING".equals(order.getPaymentStatus())) {
             refund.setRefundAmount(BigDecimal.ZERO);
             refund.setRefundStatus("COMPLETED");
             refund.setCompletedAt(LocalDateTime.now());
        } else if ("COD".equals(order.getPaymentMethod()) && "PAID".equals(order.getPaymentStatus())) {
             refund.setRefundAmount(order.getTotalAmount());
             refund.setRefundStatus("MANUAL_REFUND_REQUIRED");
        } else {
             refund.setRefundAmount(order.getTotalAmount());
             refund.setRefundStatus("INITIATED");
        }
        refundRepo.save(refund);

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
        
        return toReturnResponse(returnRepo.save(req), order.getOrderNumber());
    }

    @Override
    @Transactional
    public ReturnRequestResponse rejectReturn(Long returnId) {
        ReturnRequest req = returnRepo.findById(returnId).orElseThrow();
        req.setStatus("REJECTED");
        req.setRejectedAt(LocalDateTime.now());
        return toReturnResponse(returnRepo.save(req), "");
    }

    @Override
    public List<ReplacementRequestResponse> getAllReplacements() {
         return replacementRepo.findAllByOrderByRequestedAtDesc().stream()
                .map(r -> toReplacementResponse(r, orderRepository.findById(r.getOrderId()).map(Order::getOrderNumber).orElse(""))).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReplacementRequestResponse approveReplacement(Long replacementId) {
        ReplacementRequest req = replacementRepo.findById(replacementId).orElseThrow();
        if (!"REQUESTED".equals(req.getStatus())) throw new BadRequestException("Not in REQUESTED state");
        
        Order order = orderRepository.findById(req.getOrderId()).orElseThrow();
        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                if (product.getStock() < item.getQuantity()) {
                    throw new BadRequestException("Replacement product " + product.getName() + " is currently out of stock.");
                }
                product.setStock(product.getStock() - item.getQuantity());
                productRepository.save(product);
            }
        }
        
        req.setStatus("APPROVED");
        req.setApprovedAt(LocalDateTime.now());
        return toReplacementResponse(replacementRepo.save(req), order.getOrderNumber());
    }

    @Override
    @Transactional
    public ReplacementRequestResponse rejectReplacement(Long replacementId) {
        ReplacementRequest req = replacementRepo.findById(replacementId).orElseThrow();
        req.setStatus("REJECTED");
        req.setRejectedAt(LocalDateTime.now());
        
        Order order = orderRepository.findById(req.getOrderId()).orElseThrow();
        
        Refund refund = Refund.builder()
                .orderId(req.getOrderId())
                .userId(req.getUserId())
                .paymentMethod(order.getPaymentMethod())
                .refundReason("Replacement Rejected - Refund Issued")
                .build();
                
        if ("COD".equals(order.getPaymentMethod()) && "PENDING".equals(order.getPaymentStatus())) {
             refund.setRefundAmount(BigDecimal.ZERO);
             refund.setRefundStatus("COMPLETED");
             refund.setCompletedAt(LocalDateTime.now());
        } else if ("COD".equals(order.getPaymentMethod()) && "PAID".equals(order.getPaymentStatus())) {
             refund.setRefundAmount(order.getTotalAmount());
             refund.setRefundStatus("MANUAL_REFUND_REQUIRED");
        } else {
             refund.setRefundAmount(order.getTotalAmount());
             refund.setRefundStatus("INITIATED");
        }
        refundRepo.save(refund);
        
        return toReplacementResponse(replacementRepo.save(req), order.getOrderNumber());
    }

    @Override
    public List<RefundResponse> getAllRefunds() {
        return refundRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> toRefundResponse(r, orderRepository.findById(r.getOrderId()).map(Order::getOrderNumber).orElse(""))).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RefundResponse completeRefund(Long refundId) {
        Refund refund = refundRepo.findById(refundId).orElseThrow();
        refund.setRefundStatus("COMPLETED");
        refund.setCompletedAt(LocalDateTime.now());
        return toRefundResponse(refundRepo.save(refund), "");
    }
}
