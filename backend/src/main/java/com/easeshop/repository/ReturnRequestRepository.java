package com.easeshop.repository;

import com.easeshop.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByUserIdOrderByRequestedAtDesc(Long userId);
    org.springframework.data.domain.Page<ReturnRequest> findAllByOrderByRequestedAtDesc(org.springframework.data.domain.Pageable pageable);
    Optional<ReturnRequest> findByOrderId(Long orderId);
}
