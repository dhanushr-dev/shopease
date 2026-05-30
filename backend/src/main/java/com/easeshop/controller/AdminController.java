package com.easeshop.controller;

import com.easeshop.dto.request.CategoryRequest;
import com.easeshop.dto.request.OrderStatusRequest;
import com.easeshop.dto.request.ProductRequest;
import com.easeshop.dto.response.*;
import com.easeshop.repository.OrderRepository;
import com.easeshop.repository.ProductRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.repository.CouponRepository;
import com.easeshop.repository.ReturnRequestRepository;
import com.easeshop.repository.ReplacementRequestRepository;
import com.easeshop.repository.RefundRepository;
import com.easeshop.dto.request.BannerRequest;
import com.easeshop.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.easeshop.entity.User;
import com.easeshop.entity.Order;
import com.easeshop.util.DtoMapper;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management APIs (ROLE_ADMIN required)")
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final BannerService bannerService;
    private final ProductQuestionService questionService;
    private final OrderService orderService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final ReplacementRequestRepository replacementRequestRepository;
    private final RefundRepository refundRepository;
    private final DtoMapper mapper;

    private User getCurrentAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
    }

    // ===== Dashboard =====
    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        User admin = getCurrentAdmin();
        Long adminId = admin.getId();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.countByCreatedByIdAndActiveTrue(adminId));
        stats.put("totalOrders", orderRepository.countByAdminId(adminId));
        stats.put("totalRevenue", orderRepository.getTotalRevenueByAdminId(adminId));
        stats.put("pendingOrders", orderRepository.countByAdminIdAndStatus(
                adminId, com.easeshop.entity.OrderStatus.PENDING));
        stats.put("confirmedOrders", orderRepository.countByAdminIdAndStatus(
                adminId, com.easeshop.entity.OrderStatus.CONFIRMED));
        stats.put("shippedOrders", orderRepository.countByAdminIdAndStatus(
                adminId, com.easeshop.entity.OrderStatus.SHIPPED));
        stats.put("deliveredOrders", orderRepository.countByAdminIdAndStatus(
                adminId, com.easeshop.entity.OrderStatus.DELIVERED));
        stats.put("cancelledOrders", orderRepository.countByAdminIdAndStatus(
                adminId, com.easeshop.entity.OrderStatus.CANCELLED));

        // New stats
        List<com.easeshop.entity.Product> lowStock = productRepository.findLowStockProductsByAdmin(adminId);
        List<com.easeshop.entity.Product> outOfStock = productRepository.findOutOfStockProductsByAdmin(adminId);
        stats.put("lowStockCount", lowStock.size());
        stats.put("outOfStockCount", outOfStock.size());
        
        stats.put("totalCoupons", couponRepository.count());
        stats.put("returnRequests", returnRequestRepository.count());
        stats.put("replacementRequests", replacementRequestRepository.count());
        stats.put("refundRequests", refundRepository.count());

        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard data fetched"));
    }

    @GetMapping("/dashboard/low-stock")
    @Operation(summary = "Get low stock products")
    public ResponseEntity<ApiResponse<Map<String, List<ProductResponse>>>> getLowStockProducts() {
        User admin = getCurrentAdmin();
        List<ProductResponse> lowStock = productRepository.findLowStockProductsByAdmin(admin.getId())
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
        List<ProductResponse> outOfStock = productRepository.findOutOfStockProductsByAdmin(admin.getId())
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
        
        Map<String, List<ProductResponse>> result = new HashMap<>();
        result.put("lowStock", lowStock);
        result.put("outOfStock", outOfStock);
        
        return ResponseEntity.ok(ApiResponse.success(result, "Low stock products fetched"));
    }

    @GetMapping("/dashboard/recent-orders")
    @Operation(summary = "Get recent orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getRecentOrders() {
        User admin = getCurrentAdmin();
        Pageable limit = PageRequest.of(0, 5);
        List<Order> orders = orderRepository.findByAdminId(admin.getId(), limit).getContent();
        List<OrderResponse> responses = orders.stream().map(mapper::toOrderResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses, "Recent orders fetched"));
    }

    // ===== Product Management =====
    @GetMapping("/products")
    @Operation(summary = "Get admin's products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAdminProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        User admin = getCurrentAdmin();
        PagedResponse<ProductResponse> products = productService.getProductsByCreator(admin.getId(), page, size, "createdAt", "desc");
        return ResponseEntity.ok(ApiResponse.success(products, "Admin products fetched"));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get admin's product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getAdminProductById(@PathVariable Long id) {
        User admin = getCurrentAdmin();
        com.easeshop.entity.Product entity = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!entity.getCreatedBy().getId().equals(admin.getId())) {
            throw new RuntimeException("You do not have permission to view this product");
        }
        
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product, "Product fetched"));
    }

    @PostMapping("/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(product, "Product created"));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product updated"));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete (soft) a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    // ===== Category Management =====
    @PostMapping("/categories")
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(category, "Category created"));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated"));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories including inactive ones (admin)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategoriesAdmin();
        return ResponseEntity.ok(ApiResponse.success(categories, "All categories fetched for admin"));
    }

    // ===== Order Management =====
    @GetMapping("/orders")
    @Operation(summary = "Get all orders for admin's products")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int limitSize = Math.min(size, 100);
        User admin = getCurrentAdmin();
        Pageable pageable = PageRequest.of(page, limitSize);
        org.springframework.data.domain.Page<Order> ordersPage = orderRepository.findByAdminId(admin.getId(), pageable);
        List<OrderResponse> content = ordersPage.getContent().stream()
                .map(mapper::toOrderResponse)
                .collect(Collectors.toList());
        PagedResponse<OrderResponse> response = PagedResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(ordersPage.getNumber())
                .pageSize(ordersPage.getSize())
                .totalElements(ordersPage.getTotalElements())
                .totalPages(ordersPage.getTotalPages())
                .last(ordersPage.isLast())
                .first(ordersPage.isFirst())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response, "Orders fetched"));
    }

    @PutMapping("/orders/{orderId}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId, @Valid @RequestBody OrderStatusRequest request) {
        
        User admin = getCurrentAdmin();
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        boolean hasAdminProduct = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getCreatedBy().getId().equals(admin.getId()));
        
        if (!hasAdminProduct) {
            throw new RuntimeException("You cannot update an order that does not contain your products");
        }

        OrderResponse updated = orderService.updateOrderStatus(orderId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Order status updated"));
    }

    // ===== User Management =====
    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int limitSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, limitSize);
        org.springframework.data.domain.Page<User> usersPage = userRepository.findAll(pageable);
        List<UserResponse> content = usersPage.getContent().stream()
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
        PagedResponse<UserResponse> response = PagedResponse.<UserResponse>builder()
                .content(content)
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .last(usersPage.isLast())
                .first(usersPage.isFirst())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response, "Users fetched"));
    }

    // ===== Banner Management =====
    @GetMapping("/banners")
    @Operation(summary = "Get all banners")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAllBanners() {
        List<BannerResponse> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(ApiResponse.success(banners, "Banners fetched"));
    }

    @PostMapping("/banners")
    @Operation(summary = "Create banner")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@Valid @RequestBody BannerRequest request) {
        BannerResponse banner = bannerService.createBanner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(banner, "Banner created"));
    }

    @PutMapping("/banners/{id}")
    @Operation(summary = "Update banner")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        BannerResponse banner = bannerService.updateBanner(id, request);
        return ResponseEntity.ok(ApiResponse.success(banner, "Banner updated"));
    }

    @DeleteMapping("/banners/{id}")
    @Operation(summary = "Delete banner")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted"));
    }

    @PatchMapping("/banners/{id}/toggle")
    @Operation(summary = "Toggle banner status")
    public ResponseEntity<ApiResponse<BannerResponse>> toggleBannerStatus(@PathVariable Long id) {
        BannerResponse banner = bannerService.toggleBannerStatus(id);
        return ResponseEntity.ok(ApiResponse.success(banner, "Banner status toggled"));
    }

    // ===== Question Management =====
    @GetMapping("/questions")
    @Operation(summary = "Get all product questions for admin")
    public ResponseEntity<ApiResponse<List<com.easeshop.entity.ProductQuestion>>> getAllQuestions() {
        return ResponseEntity.ok(ApiResponse.success(questionService.getAllQuestions(), "All questions fetched"));
    }

    @PutMapping("/questions/{id}/answer")
    @Operation(summary = "Answer a product question")
    public ResponseEntity<ApiResponse<com.easeshop.entity.ProductQuestion>> answerQuestion(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.easeshop.dto.request.AnswerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(questionService.answerQuestion(id, request), "Question answered"));
    }
}
