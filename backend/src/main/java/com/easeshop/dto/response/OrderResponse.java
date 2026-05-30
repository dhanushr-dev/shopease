package com.easeshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for order response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String notes;
    private List<OrderItemResponse> items;
    private AddressResponse shippingAddress;
    private String userName;
    private String userEmail;
    private BigDecimal discountAmount;
    private String couponCode;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
