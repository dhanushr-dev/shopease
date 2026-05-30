package com.easeshop.repository;

import com.easeshop.entity.ReplacementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReplacementRequestRepository extends JpaRepository<ReplacementRequest, Long> {
    List<ReplacementRequest> findByUserIdOrderByRequestedAtDesc(Long userId);
    org.springframework.data.domain.Page<ReplacementRequest> findAllByOrderByRequestedAtDesc(org.springframework.data.domain.Pageable pageable);
    Optional<ReplacementRequest> findByOrderId(Long orderId);
}
