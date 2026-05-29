package com.easeshop.controller;

import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.WishlistItemResponse;
import com.easeshop.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Wishlist management APIs")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user's wishlist")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> getWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<WishlistItemResponse> wishlist = wishlistService.getWishlist(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(wishlist, "Wishlist fetched"));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        WishlistItemResponse item = wishlistService.addToWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(item, "Product added to wishlist."));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product removed from wishlist."));
    }

    @PostMapping("/{productId}/move-to-cart")
    @Operation(summary = "Move wishlist item to cart")
    public ResponseEntity<ApiResponse<Void>> moveToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.moveToCart(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product moved to cart."));
    }

    @GetMapping("/{productId}/check")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        boolean inWishlist = wishlistService.isInWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(inWishlist, "Checked"));
    }
}
