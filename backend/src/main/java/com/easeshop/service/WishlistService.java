package com.easeshop.service;

import com.easeshop.dto.response.WishlistItemResponse;
import java.util.List;

public interface WishlistService {
    WishlistItemResponse addToWishlist(String email, Long productId);
    void removeFromWishlist(String email, Long productId);
    List<WishlistItemResponse> getWishlist(String email);
    void moveToCart(String email, Long productId);
    boolean isInWishlist(String email, Long productId);
}
