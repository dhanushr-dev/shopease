package com.easeshop.controller;

import com.easeshop.dto.request.CouponApplyRequest;
import com.easeshop.dto.request.CouponRequest;
import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.CouponApplyResponse;
import com.easeshop.dto.response.CouponResponse;
import com.easeshop.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon and discount APIs")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/api/coupons/apply")
    @Operation(summary = "Apply a coupon code")
    public ResponseEntity<ApiResponse<CouponApplyResponse>> applyCoupon(
            @Valid @RequestBody CouponApplyRequest request) {
        CouponApplyResponse result = couponService.applyCoupon(request);
        return ResponseEntity.ok(ApiResponse.success(result, result.getMessage()));
    }

    @GetMapping("/api/coupons/active")
    @Operation(summary = "Get active coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getActiveCoupons() {
        List<CouponResponse> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons, "Active coupons fetched"));
    }

    @PostMapping("/api/admin/coupons")
    @Operation(summary = "Admin: Create a coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon created successfully."));
    }

    @GetMapping("/api/admin/coupons")
    @Operation(summary = "Admin: Get all coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons, "All coupons fetched"));
    }

    @PutMapping("/api/admin/coupons/{id}")
    @Operation(summary = "Admin: Update a coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon updated successfully."));
    }

    @PatchMapping("/api/admin/coupons/{id}/deactivate")
    @Operation(summary = "Admin: Deactivate a coupon")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(@PathVariable Long id) {
        couponService.deactivateCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Coupon deactivated."));
    }
}
