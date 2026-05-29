package com.easeshop.service;

import com.easeshop.dto.request.CartItemRequest;
import com.easeshop.dto.response.CartResponse;

public interface CartService {
    /** Gets the cart for the authenticated user. */
    CartResponse getCart(String email);
    /** Adds an item to the cart. */
    CartResponse addToCart(String email, CartItemRequest request);
    /** Updates a cart item quantity. */
    CartResponse updateCartItem(String email, Long itemId, CartItemRequest request);
    /** Removes an item from the cart. */
    CartResponse removeFromCart(String email, Long itemId);
    /** Clears all items from the cart. */
    CartResponse clearCart(String email);
}
