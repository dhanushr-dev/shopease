package com.easeshop.service.impl;

import com.easeshop.dto.request.CartItemRequest;
import com.easeshop.dto.response.WishlistItemResponse;
import com.easeshop.entity.Product;
import com.easeshop.entity.User;
import com.easeshop.entity.WishlistItem;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.ProductRepository;
import com.easeshop.repository.ReviewRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.repository.WishlistItemRepository;
import com.easeshop.service.CartService;
import com.easeshop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final CartService cartService;

    @Override
    @Transactional
    public WishlistItemResponse addToWishlist(String email, Long productId) {
        User user = findUserByEmail(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("Product already exists in wishlist.");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();
        item = wishlistRepository.save(item);
        log.info("❤️ Product added to wishlist: {} by {}", product.getName(), email);
        return toResponse(item);
    }

    @Override
    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        User user = findUserByEmail(email);
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
        log.info("💔 Product removed from wishlist: productId={} by {}", productId, email);
    }

    @Override
    public List<WishlistItemResponse> getWishlist(String email) {
        User user = findUserByEmail(email);
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void moveToCart(String email, Long productId) {
        User user = findUserByEmail(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStock() <= 0) {
            throw new BadRequestException("Product is out of stock.");
        }

        cartService.addToCart(email, CartItemRequest.builder().productId(productId).quantity(1).build());
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
        log.info("🛒 Moved from wishlist to cart: {} by {}", product.getName(), email);
    }

    @Override
    public boolean isInWishlist(String email, Long productId) {
        User user = findUserByEmail(email);
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        Product p = item.getProduct();
        Double avgRating = reviewRepository.getAverageRatingByProductId(p.getId());
        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productImageUrl(p.getImageUrl())
                .productPrice(p.getPrice())
                .productStock(p.getStock())
                .categoryName(p.getCategory().getName())
                .brand(p.getBrand())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .addedAt(item.getCreatedAt())
                .build();
    }
}
