package com.easeshop.service.impl;

import com.easeshop.dto.request.ProductRequest;
import com.easeshop.dto.response.PagedResponse;
import com.easeshop.dto.response.ProductResponse;
import com.easeshop.entity.Category;
import com.easeshop.entity.Product;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.CategoryRepository;
import com.easeshop.repository.ProductRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.service.ProductService;
import com.easeshop.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import com.easeshop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final DtoMapper mapper;

    @Override
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findByActiveTrue(pageable);
        return buildPagedResponse(productPage);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapper.toProductResponse(product);
    }

    @Override
    public PagedResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findByCategoryId(categoryId, pageable);
        return buildPagedResponse(productPage);
    }

    @Override
    public PagedResponse<ProductResponse> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchProducts(keyword, pageable);
        return buildPagedResponse(productPage);
    }

    @Override
    public PagedResponse<ProductResponse> filterProducts(Long categoryId, BigDecimal minPrice,
            BigDecimal maxPrice, String keyword, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findByFilters(categoryId, minPrice, maxPrice, keyword, pageable);
        return buildPagedResponse(productPage);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (category.getActive() != null && !category.getActive()) {
            throw new com.easeshop.exception.BadRequestException("Please select a valid active category.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String finalImageUrl = request.getImageUrl();
        if (finalImageUrl == null || finalImageUrl.trim().isEmpty()) {
            finalImageUrl = generateProductImageUrl(request.getName(), category.getName(), request.getBrand());
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(finalImageUrl)
                .brand(request.getBrand())
                .category(category)
                .createdBy(currentUser)
                .active(true)
                .build();

        product = productRepository.save(product);
        log.info("✅ Product created: {} (ID: {})", product.getName(), product.getId());
        return mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (category.getActive() != null && !category.getActive()) {
            throw new com.easeshop.exception.BadRequestException("Please select a valid active category.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isOwner = product.getCreatedBy() != null && product.getCreatedBy().getEmail().equals(email);
        boolean isOrphanSeed = product.getCreatedBy() == null;
        if (!isOwner && !isOrphanSeed) {
            throw new com.easeshop.exception.BadRequestException("You can only update your own products");
        }

        String finalImageUrl = request.getImageUrl();
        if (finalImageUrl == null || finalImageUrl.trim().isEmpty()) {
            finalImageUrl = generateProductImageUrl(request.getName(), category.getName(), request.getBrand());
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(finalImageUrl);
        product.setBrand(request.getBrand());
        product.setCategory(category);

        product = productRepository.save(product);
        log.info("✅ Product updated: {} (ID: {})", product.getName(), product.getId());
        return mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isOwner = product.getCreatedBy() != null && product.getCreatedBy().getEmail().equals(email);
        boolean isOrphanSeed = product.getCreatedBy() == null;
        if (!isOwner && !isOrphanSeed) {
            throw new com.easeshop.exception.BadRequestException("You can delete only your own products.");
        }

        product.setActive(false);
        productRepository.save(product);
        log.info("🗑️ Product soft-deleted: {} (ID: {})", product.getName(), id);
    }

    @Override
    public PagedResponse<ProductResponse> getProductsByCreator(Long userId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findByCreatedByIdAndActiveTrue(userId, pageable);
        return buildPagedResponse(productPage);
    }

    private PagedResponse<ProductResponse> buildPagedResponse(Page<Product> page) {
        return PagedResponse.<ProductResponse>builder()
                .content(page.getContent().stream().map(mapper::toProductResponse).collect(Collectors.toList()))
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    private String generateProductImageUrl(String name, String categoryName, String brand) {
        return "https://placehold.co/600x600?text=ShopEase+Product";
    }
}
