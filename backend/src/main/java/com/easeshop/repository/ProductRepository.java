package com.easeshop.repository;

import com.easeshop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

/**
 * Repository for Product entity operations.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCreatedByIdAndActiveTrue(Long userId, Pageable pageable);

    long countByCreatedByIdAndActiveTrue(Long userId);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> findByFilters(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable);

    long countByActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= 5 AND p.stock > 0")
    java.util.List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock = 0")
    java.util.List<Product> findOutOfStockProducts();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= 5 AND p.stock > 0 AND p.createdBy.id = :adminId")
    java.util.List<Product> findLowStockProductsByAdmin(@Param("adminId") Long adminId);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock = 0 AND p.createdBy.id = :adminId")
    java.util.List<Product> findOutOfStockProductsByAdmin(@Param("adminId") Long adminId);
}
