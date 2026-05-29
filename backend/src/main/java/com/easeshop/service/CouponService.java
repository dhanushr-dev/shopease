package com.easeshop.service;

import com.easeshop.dto.request.CouponApplyRequest;
import com.easeshop.dto.request.CouponRequest;
import com.easeshop.dto.response.CouponApplyResponse;
import com.easeshop.dto.response.CouponResponse;
import java.util.List;

public interface CouponService {
    CouponApplyResponse applyCoupon(CouponApplyRequest request);
    List<CouponResponse> getActiveCoupons();
    CouponResponse createCoupon(CouponRequest request);
    CouponResponse updateCoupon(Long id, CouponRequest request);
    void deactivateCoupon(Long id);
    List<CouponResponse> getAllCoupons();
    void incrementUsage(String couponCode);
}
