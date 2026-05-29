package com.easeshop.repository;

import com.easeshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Category entity operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    Boolean existsByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Category c WHERE c.active IS NULL OR c.active = true")
    java.util.List<Category> findAllActiveCategories();
}
