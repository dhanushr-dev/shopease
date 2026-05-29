package com.easeshop.controller;

import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.PagedResponse;
import com.easeshop.dto.response.ProductResponse;
import com.easeshop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Public product browsing APIs")
public class ProductController {

    private final ProductService productService;
    private final com.easeshop.service.ProductQuestionService questionService;
    private final com.easeshop.service.UserService userService;

    @GetMapping
    @Operation(summary = "Get all products with pagination, filtering, and sorting")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<ProductResponse> products;
        if (categoryId != null || minPrice != null || maxPrice != null || keyword != null) {
            products = productService.filterProducts(categoryId, minPrice, maxPrice, keyword, page, size, sortBy, sortDir);
        } else {
            products = productService.getAllProducts(page, size, sortBy, sortDir);
        }
        return ResponseEntity.ok(ApiResponse.success(products, "Products fetched"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product, "Product fetched"));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PagedResponse<ProductResponse> products = productService.getProductsByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(products, "Products fetched by category"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by keyword")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PagedResponse<ProductResponse> products = productService.searchProducts(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(products, "Search results"));
    }

    @PostMapping("/{productId}/questions")
    @Operation(summary = "Ask a question about a product")
    public ResponseEntity<ApiResponse<com.easeshop.entity.ProductQuestion>> askQuestion(
            @PathVariable Long productId,
            @jakarta.validation.Valid @RequestBody com.easeshop.dto.request.QuestionRequest request) {
        com.easeshop.entity.User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(questionService.askQuestion(productId, user, request), "Question submitted"));
    }

    @GetMapping("/{productId}/questions")
    @Operation(summary = "Get questions for a product")
    public ResponseEntity<ApiResponse<java.util.List<com.easeshop.entity.ProductQuestion>>> getQuestions(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByProduct(productId), "Questions fetched"));
    }
}
