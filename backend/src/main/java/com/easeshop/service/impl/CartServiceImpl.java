package com.easeshop.service.impl;

import com.easeshop.dto.request.CartItemRequest;
import com.easeshop.dto.response.CartResponse;
import com.easeshop.entity.Cart;
import com.easeshop.entity.CartItem;
import com.easeshop.entity.Product;
import com.easeshop.entity.User;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.*;
import com.easeshop.service.CartService;
import com.easeshop.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DtoMapper mapper;

    @Override
    public CartResponse getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return mapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String email, CartItemRequest request) {
        if (request.getProductId() == null) {
            throw new BadRequestException("Product ID is required for adding to cart");
        }
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + product.getStock());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()) &&
                        Objects.equals(item.getSelectedVariant(), request.getSelectedVariant()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > product.getStock()) {
                throw new BadRequestException("Cannot add more. Stock available: " + product.getStock());
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
            log.info("📦 Cart item quantity updated: {} x{} variant: {}", product.getName(), newQty, request.getSelectedVariant());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .selectedVariant(request.getSelectedVariant())
                    .build();
            cart.getItems().add(newItem);
            cartRepository.save(cart);
            log.info("📦 Product added to cart: {} variant: {}", product.getName(), request.getSelectedVariant());
        }

        // Refresh cart
        cart = cartRepository.findByUserId(cart.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "user", email));
        return mapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String email, Long itemId, CartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        if (request.getQuantity() > item.getProduct().getStock()) {
            throw new BadRequestException("Insufficient stock. Available: " + item.getProduct().getStock());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        log.info("📦 Cart item updated: {} x{}", item.getProduct().getName(), request.getQuantity());

        cart = cartRepository.findByUserId(cart.getUser().getId()).orElseThrow();
        return mapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeFromCart(String email, Long itemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        log.info("🗑️ Removed from cart: {}", item.getProduct().getName());

        cart = cartRepository.findByUserId(cart.getUser().getId()).orElseThrow();
        return mapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("🗑️ Cart cleared for user: {}", email);
        return mapper.toCartResponse(cart);
    }

    private Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }
}
