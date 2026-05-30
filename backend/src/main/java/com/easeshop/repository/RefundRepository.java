package com.easeshop.repository;

import com.easeshop.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByUserIdOrderByCreatedAtDesc(Long userId);
    org.springframework.data.domain.Page<Refund> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
    Optional<Refund> findByOrderId(Long orderId);
}
