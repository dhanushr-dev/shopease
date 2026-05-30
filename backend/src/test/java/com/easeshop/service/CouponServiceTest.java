package com.easeshop.service;

import com.easeshop.dto.request.CouponApplyRequest;
import com.easeshop.dto.response.CouponApplyResponse;
import com.easeshop.entity.Coupon;
import com.easeshop.entity.DiscountType;
import com.easeshop.exception.BadRequestException;
import com.easeshop.repository.CouponRepository;
import com.easeshop.service.impl.CouponServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponServiceImpl couponService;

    private Coupon percentageCoupon;
    private Coupon fixedCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = Coupon.builder()
                .id(1L)
                .code("SUMMER10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(10)) // 10%
                .maxDiscountAmount(BigDecimal.valueOf(100))
                .minOrderAmount(BigDecimal.valueOf(500))
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(10))
                .usageLimit(100)
                .usedCount(0)
                .active(true)
                .build();

        fixedCoupon = Coupon.builder()
                .id(2L)
                .code("SAVE50")
                .discountType(DiscountType.FIXED)
                .discountValue(BigDecimal.valueOf(50))
                .minOrderAmount(BigDecimal.valueOf(200))
                .active(true)
                .build();
    }

    @Test
    void testApplyCoupon_Percentage_Success() {
        when(couponRepository.findByCodeIgnoreCase("SUMMER10")).thenReturn(Optional.of(percentageCoupon));

        CouponApplyRequest request = CouponApplyRequest.builder()
                .couponCode("SUMMER10")
                .cartTotal(BigDecimal.valueOf(600))
                .build();

        CouponApplyResponse response = couponService.applyCoupon(request);

        assertNotNull(response);
        assertEquals("SUMMER10", response.getCouponCode());
        assertEquals(0, BigDecimal.valueOf(60).compareTo(response.getDiscountAmount()));
        assertEquals(0, BigDecimal.valueOf(540).compareTo(response.getFinalAmount()));
    }

    @Test
    void testApplyCoupon_Fixed_Success() {
        when(couponRepository.findByCodeIgnoreCase("SAVE50")).thenReturn(Optional.of(fixedCoupon));

        CouponApplyRequest request = CouponApplyRequest.builder()
                .couponCode("SAVE50")
                .cartTotal(BigDecimal.valueOf(300))
                .build();

        CouponApplyResponse response = couponService.applyCoupon(request);

        assertNotNull(response);
        assertEquals("SAVE50", response.getCouponCode());
        assertEquals(0, BigDecimal.valueOf(50).compareTo(response.getDiscountAmount()));
        assertEquals(0, BigDecimal.valueOf(250).compareTo(response.getFinalAmount()));
    }

    @Test
    void testApplyCoupon_MinOrderNotMet() {
        when(couponRepository.findByCodeIgnoreCase("SUMMER10")).thenReturn(Optional.of(percentageCoupon));

        CouponApplyRequest request = CouponApplyRequest.builder()
                .couponCode("SUMMER10")
                .cartTotal(BigDecimal.valueOf(400)) // Min is 500
                .build();

        assertThrows(BadRequestException.class, () -> couponService.applyCoupon(request));
    }

    @Test
    void testApplyCoupon_Expired() {
        percentageCoupon.setEndDate(LocalDateTime.now().minusDays(1)); // Expired yesterday
        when(couponRepository.findByCodeIgnoreCase("SUMMER10")).thenReturn(Optional.of(percentageCoupon));

        CouponApplyRequest request = CouponApplyRequest.builder()
            .couponCode("SUMMER10")
            .cartTotal(BigDecimal.valueOf(600))
            .build();

        assertThrows(BadRequestException.class, () -> couponService.applyCoupon(request));
    }

    @Test
    void invalidCoupon_shouldThrowException() {
        when(couponRepository.findByCodeIgnoreCase("INVALID")).thenReturn(Optional.empty());

        CouponApplyRequest request = CouponApplyRequest.builder()
            .couponCode("INVALID")
            .cartTotal(BigDecimal.valueOf(600))
            .build();

        assertThrows(BadRequestException.class, () -> couponService.applyCoupon(request));
    }
}
