package com.easeshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCancelResponse {
    private Long orderId;
    private String oldStatus;
    private String newStatus;
    private BigDecimal cancellationFee;
    private BigDecimal refundAmount;
    private String message;
}
