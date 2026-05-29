package com.easeshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for product response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String brand;
    private Boolean active;
    private Long categoryId;
    private String categoryName;
    private Double averageRating;
    private Long reviewCount;
    private LocalDateTime createdAt;
    private java.util.List<String> variants;
}
