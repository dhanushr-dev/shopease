package com.easeshop.repository;

import com.easeshop.entity.Order;
import com.easeshop.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Order entity operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o")
    long getTotalOrderCount();

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.createdBy.id = :adminId ORDER BY o.createdAt DESC")
    Page<Order> findByAdminId(@Param("adminId") Long adminId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.createdBy.id = :adminId")
    long countByAdminId(@Param("adminId") Long adminId);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.createdBy.id = :adminId AND o.status = :status")
    long countByAdminIdAndStatus(@Param("adminId") Long adminId, @Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(i.price * i.quantity), 0) FROM OrderItem i WHERE i.product.createdBy.id = :adminId AND i.order.status != 'CANCELLED'")
    BigDecimal getTotalRevenueByAdminId(@Param("adminId") Long adminId);

    /**
     * Loads an Order with all its items, product details, and shipping address eagerly
     * in a single JOIN FETCH query. Use this when you need to map the full OrderResponse
     * (e.g., after payment verification) to avoid LazyInitializationException.
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product " +
           "LEFT JOIN FETCH o.shippingAddress " +
           "LEFT JOIN FETCH o.user " +
           "WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
}
