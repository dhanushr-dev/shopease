package com.easeshop.util;

import com.easeshop.dto.response.*;
import com.easeshop.entity.*;
import com.easeshop.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.stream.Collectors;

/**
 * Utility class for mapping entities to DTOs and vice versa.
 * Centralizes all conversion logic to keep services clean.
 */
@Component
@RequiredArgsConstructor
public class DtoMapper {

    private final ReviewRepository reviewRepository;

    /**
     * Maps User entity to UserResponse DTO.
     */
    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Maps Product entity to ProductResponse DTO.
     */
    public ProductResponse toProductResponse(Product product) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(product.getId());
        long reviewCount = reviewRepository.countByProductId(product.getId());
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .brand(product.getBrand())
                .active(product.getActive())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewCount)
                .createdAt(product.getCreatedAt())
                .variants(product.getVariants())
                .build();
    }

    /**
     * Maps Category entity to CategoryResponse DTO.
     */
    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.getActive() != null ? category.getActive() : true)
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .createdAt(category.getCreatedAt())
                .build();
    }

    /**
     * Maps Cart entity to CartResponse DTO.
     */
    public CartResponse toCartResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .items(cart.getItems().stream()
                        .map(this::toCartItemResponse)
                        .collect(Collectors.toList()))
                .totalAmount(cart.getTotalAmount())
                .totalItems(cart.getTotalItems())
                .build();
    }

    /**
     * Maps CartItem entity to CartItemResponse DTO.
     */
    public CartItemResponse toCartItemResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getImageUrl())
                .productPrice(cartItem.getProduct().getPrice())
                .quantity(cartItem.getQuantity())
                .availableStock(cartItem.getProduct().getStock())
                .subtotal(cartItem.getSubtotal())
                .selectedVariant(cartItem.getSelectedVariant())
                .build();
    }

    /**
     * Maps Order entity to OrderResponse DTO.
     */
    public OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems().stream()
                        .map(this::toOrderItemResponse)
                        .collect(Collectors.toList()))
                .shippingAddress(order.getShippingAddress() != null ?
                        toAddressResponse(order.getShippingAddress()) : null)
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .discountAmount(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO)
                .couponCode(order.getCouponCode())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Maps OrderItem entity to OrderItemResponse DTO.
     */
    public OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProductName())
                .productImageUrl(orderItem.getProductImageUrl())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .subtotal(orderItem.getSubtotal())
                .selectedVariant(orderItem.getSelectedVariant())
                .build();
    }

    /**
     * Maps Address entity to AddressResponse DTO.
     */
    public AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .build();
    }

    /**
     * Maps Banner entity to BannerResponse DTO.
     */
    public BannerResponse toBannerResponse(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .buttonText(banner.getButtonText())
                .buttonLink(banner.getButtonLink())
                .active(banner.getActive())
                .createdAt(banner.getCreatedAt())
                .build();
    }
}
