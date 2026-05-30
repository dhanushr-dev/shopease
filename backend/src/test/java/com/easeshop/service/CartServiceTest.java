package com.easeshop.service;

import com.easeshop.dto.request.CartItemRequest;
import com.easeshop.dto.response.CartResponse;
import com.easeshop.entity.Cart;
import com.easeshop.entity.CartItem;
import com.easeshop.entity.Product;
import com.easeshop.entity.User;
import com.easeshop.exception.BadRequestException;
import com.easeshop.repository.*;
import com.easeshop.service.impl.CartServiceImpl;
import com.easeshop.util.DtoMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private DtoMapper mapper;

    @InjectMocks
    private CartServiceImpl cartService;

    private User user;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@shopease.com")
                .build();

        product = Product.builder()
                .id(100L)
                .name("Product A")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .active(true)
                .build();

        cart = Cart.builder()
                .id(10L)
                .user(user)
                .items(new ArrayList<>())
                .build();
    }

    @Test
    void addToCart_shouldAddNewProduct() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse mockResponse = CartResponse.builder().id(cart.getId()).totalItems(1).build();
        when(mapper.toCartResponse(any(Cart.class))).thenReturn(mockResponse);

        CartItemRequest request = CartItemRequest.builder()
                .productId(product.getId())
                .quantity(2)
                .selectedVariant("Red")
                .build();

        CartResponse response = cartService.addToCart(user.getEmail(), request);

        assertNotNull(response);
        assertEquals(cart.getId(), response.getId());
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addToCart_existingProduct_shouldIncreaseQuantity() {
        CartItem existingItem = CartItem.builder()
                .id(20L)
                .cart(cart)
                .product(product)
                .quantity(3)
                .selectedVariant("Red")
                .build();
        cart.getItems().add(existingItem);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        CartResponse mockResponse = CartResponse.builder().id(cart.getId()).totalItems(1).build();
        when(mapper.toCartResponse(any(Cart.class))).thenReturn(mockResponse);

        CartItemRequest request = CartItemRequest.builder()
                .productId(product.getId())
                .quantity(2)
                .selectedVariant("Red")
                .build();

        CartResponse response = cartService.addToCart(user.getEmail(), request);

        assertNotNull(response);
        assertEquals(5, existingItem.getQuantity());
        verify(cartItemRepository).save(existingItem);
    }

    @Test
    void removeFromCart_shouldRemoveItem() {
        CartItem item = CartItem.builder()
                .id(20L)
                .cart(cart)
                .product(product)
                .quantity(3)
                .build();
        cart.getItems().add(item);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(20L)).thenReturn(Optional.of(item));

        CartResponse mockResponse = CartResponse.builder().id(cart.getId()).totalItems(0).build();
        when(mapper.toCartResponse(any(Cart.class))).thenReturn(mockResponse);

        CartResponse response = cartService.removeFromCart(user.getEmail(), 20L);

        assertNotNull(response);
        verify(cartItemRepository).delete(item);
        assertFalse(cart.getItems().contains(item));
    }

    @Test
    void addOutOfStockProduct_shouldThrowException() {
        product.setStock(1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        CartItemRequest request = CartItemRequest.builder()
                .productId(product.getId())
                .quantity(2)
                .build();

        assertThrows(BadRequestException.class, () -> cartService.addToCart(user.getEmail(), request));
        verify(cartRepository, never()).save(any(Cart.class));
    }
}
