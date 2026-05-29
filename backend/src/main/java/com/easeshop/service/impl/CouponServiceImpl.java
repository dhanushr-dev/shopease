package com.easeshop.service.impl;

import com.easeshop.dto.request.CouponApplyRequest;
import com.easeshop.dto.request.CouponRequest;
import com.easeshop.dto.response.CouponApplyResponse;
import com.easeshop.dto.response.CouponResponse;
import com.easeshop.entity.Coupon;
import com.easeshop.entity.DiscountType;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.CouponRepository;
import com.easeshop.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponApplyResponse applyCoupon(CouponApplyRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code."));

        if (!coupon.getActive()) {
            throw new BadRequestException("This coupon is inactive.");
        }
        if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This coupon has expired.");
        }
        if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("This coupon is not yet active.");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("This coupon has reached its usage limit.");
        }
        if (coupon.getMinOrderAmount() != null && request.getCartTotal().compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount of ₹" + coupon.getMinOrderAmount().intValue() + " required for this coupon.");
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = request.getCartTotal().multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(request.getCartTotal()) > 0) {
            discount = request.getCartTotal();
        }

        BigDecimal finalAmount = request.getCartTotal().subtract(discount);

        return CouponApplyResponse.builder()
                .couponCode(coupon.getCode())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .message("Coupon applied successfully!")
                .build();
    }

    @Override
    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findActiveCoupons(LocalDateTime.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new BadRequestException("Coupon code already exists.");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .description(request.getDescription())
                .discountType(DiscountType.valueOf(request.getDiscountType()))
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        coupon = couponRepository.save(coupon);
        log.info("🎟️ Coupon created: {}", coupon.getCode());
        return toResponse(coupon);
    }

    @Override
    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(DiscountType.valueOf(request.getDiscountType()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setUsageLimit(request.getUsageLimit());
        if (request.getActive() != null) coupon.setActive(request.getActive());

        coupon = couponRepository.save(coupon);
        log.info("✏️ Coupon updated: {}", coupon.getCode());
        return toResponse(coupon);
    }

    @Override
    @Transactional
    public void deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        coupon.setActive(false);
        couponRepository.save(coupon);
        log.info("🚫 Coupon deactivated: {}", coupon.getCode());
    }

    @Override
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementUsage(String couponCode) {
        couponRepository.findByCodeIgnoreCase(couponCode).ifPresent(c -> {
            c.setUsedCount(c.getUsedCount() + 1);
            couponRepository.save(c);
        });
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .active(coupon.getActive())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
