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
public class CouponApplyResponse {
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;
}
