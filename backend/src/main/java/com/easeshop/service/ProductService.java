package com.easeshop.service;

import com.easeshop.dto.request.ProductRequest;
import com.easeshop.dto.response.PagedResponse;
import com.easeshop.dto.response.ProductResponse;
import java.math.BigDecimal;

public interface ProductService {
    /** Gets all active products with pagination. */
    PagedResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir);
    /** Gets a product by ID. */
    ProductResponse getProductById(Long id);
    /** Gets products by creator */
    PagedResponse<ProductResponse> getProductsByCreator(Long userId, int page, int size, String sortBy, String sortDir);
    /** Gets products by category. */
    PagedResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size);
    /** Searches products by keyword. */
    PagedResponse<ProductResponse> searchProducts(String keyword, int page, int size);
    /** Filters products by multiple criteria. */
    PagedResponse<ProductResponse> filterProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword, int page, int size, String sortBy, String sortDir);
    /** Creates a new product (admin). */
    ProductResponse createProduct(ProductRequest request);
    /** Updates a product (admin). */
    ProductResponse updateProduct(Long id, ProductRequest request);
    /** Deletes a product (admin). */
    void deleteProduct(Long id);
}
