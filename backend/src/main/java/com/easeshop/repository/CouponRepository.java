package com.easeshop.repository;

import com.easeshop.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT c FROM Coupon c WHERE c.active = true AND (c.endDate IS NULL OR c.endDate > :now) AND (c.startDate IS NULL OR c.startDate <= :now)")
    List<Coupon> findActiveCoupons(LocalDateTime now);

    List<Coupon> findAllByOrderByCreatedAtDesc();
}
