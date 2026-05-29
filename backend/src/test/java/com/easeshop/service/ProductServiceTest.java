package com.easeshop.service;

import com.easeshop.dto.request.ProductRequest;
import com.easeshop.dto.response.ProductResponse;
import com.easeshop.entity.Category;
import com.easeshop.entity.Product;
import com.easeshop.entity.User;
import com.easeshop.exception.BadRequestException;
import com.easeshop.repository.CategoryRepository;
import com.easeshop.repository.ProductRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.service.impl.ProductServiceImpl;
import com.easeshop.util.DtoMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private DtoMapper mapper;

    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category activeCategory;
    private Category inactiveCategory;
    private User adminUser;

    @BeforeEach
    void setUp() {
        activeCategory = Category.builder()
                .id(1L)
                .name("Men's Wear")
                .active(true)
                .build();

        inactiveCategory = Category.builder()
                .id(2L)
                .name("Old Category")
                .active(false)
                .build();

        adminUser = User.builder()
                .id(10L)
                .name("Admin")
                .email("admin@shopease.com")
                .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testCreateProduct_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("admin@shopease.com");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(activeCategory));
        when(userRepository.findByEmail("admin@shopease.com")).thenReturn(Optional.of(adminUser));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(500L);
            return p;
        });

        ProductResponse mockResponse = ProductResponse.builder()
                .id(500L)
                .name("T-shirt")
                .price(BigDecimal.valueOf(500))
                .categoryId(1L)
                .categoryName("Men's Wear")
                .build();
        when(mapper.toProductResponse(any(Product.class))).thenReturn(mockResponse);

        ProductRequest request = ProductRequest.builder()
                .name("T-shirt")
                .description("Cotton T-shirt")
                .price(BigDecimal.valueOf(500))
                .stock(20)
                .categoryId(1L)
                .brand("Puma")
                .build();

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals("T-shirt", response.getName());
        assertEquals(1L, response.getCategoryId());
    }

    @Test
    void testCreateProduct_InactiveCategory() {
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(inactiveCategory));

        ProductRequest request = ProductRequest.builder()
                .name("T-shirt")
                .categoryId(2L)
                .build();

        assertThrows(BadRequestException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any(Product.class));
    }
}
