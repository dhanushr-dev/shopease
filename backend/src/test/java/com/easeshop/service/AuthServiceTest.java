package com.easeshop.service;

import com.easeshop.dto.request.LoginRequest;
import com.easeshop.dto.response.AuthResponse;
import com.easeshop.entity.Role;
import com.easeshop.entity.User;
import com.easeshop.exception.BadRequestException;
import com.easeshop.repository.CartRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.security.JwtUtil;
import com.easeshop.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private User sampleAdmin;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .password("encodedPassword123")
                .role(Role.ROLE_USER)
                .phone("1234567890")
                .build();

        sampleAdmin = User.builder()
                .id(2L)
                .name("Admin User")
                .email("admin@shopease.com")
                .password("encodedPasswordAdmin")
                .role(Role.ROLE_ADMIN)
                .phone("0987654321")
                .build();
    }

    @Test
    void loginSuccess_shouldReturnJwtToken() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("user123")
                .accountType("USER")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));

        Authentication mockAuthentication = mock(Authentication.class);
        UserDetails mockUserDetails = new org.springframework.security.core.userdetails.User(
                sampleUser.getEmail(), sampleUser.getPassword(),
                Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(Role.ROLE_USER.name()))
        );

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(mockAuthentication.getPrincipal()).thenReturn(mockUserDetails);
        when(jwtUtil.generateToken(anyMap(), any(UserDetails.class))).thenReturn("mock-jwt-token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals(1L, response.getUserId());
        assertEquals("John Doe", response.getName());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("ROLE_USER", response.getRole());
        assertEquals("USER", response.getAccountType());

        verify(userRepository, times(1)).findByEmail("john@example.com");
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, times(1)).generateToken(anyMap(), any(UserDetails.class));
    }

    @Test
    void loginWrongPassword_shouldThrowException() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("wrongpassword")
                .accountType("USER")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.login(request));
        assertEquals("Incorrect password. Please try again.", exception.getMessage());

        verify(userRepository, times(1)).findByEmail("john@example.com");
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, never()).generateToken(anyMap(), any(UserDetails.class));
    }

    @Test
    void loginUserNotFound_shouldThrowException() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("password123")
                .accountType("USER")
                .build();

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.login(request));
        assertEquals("No account found with this email. Please register first.", exception.getMessage());

        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, never()).generateToken(anyMap(), any(UserDetails.class));
    }

    @Test
    void loginWithWrongAccountType_shouldThrowException() {
        // Case 1: Actual User tries to login as ADMIN/SELLER
        LoginRequest requestAsAdmin = LoginRequest.builder()
                .email("john@example.com")
                .password("user123")
                .accountType("ADMIN")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));

        BadRequestException exceptionAdmin = assertThrows(BadRequestException.class, () -> authService.login(requestAsAdmin));
        assertEquals("This email is registered as User. Please select User login.", exceptionAdmin.getMessage());

        // Case 2: Actual Admin tries to login as USER
        LoginRequest requestAsUser = LoginRequest.builder()
                .email("admin@shopease.com")
                .password("admin123")
                .accountType("USER")
                .build();

        when(userRepository.findByEmail("admin@shopease.com")).thenReturn(Optional.of(sampleAdmin));

        BadRequestException exceptionUser = assertThrows(BadRequestException.class, () -> authService.login(requestAsUser));
        assertEquals("This email is registered as Seller/Admin. Please select Seller/Admin login.", exceptionUser.getMessage());

        verify(userRepository, times(1)).findByEmail("john@example.com");
        verify(userRepository, times(1)).findByEmail("admin@shopease.com");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, never()).generateToken(anyMap(), any(UserDetails.class));
    }

    @Test
    void registerNormalUser_shouldCreateUserRoleOnly() {
        // Arrange
        com.easeshop.dto.request.RegisterRequest request = com.easeshop.dto.request.RegisterRequest.builder()
                .name("Alice Smith")
                .email("alice@example.com")
                .password("password123")
                .phone("1234567892")
                .accountType("USER")
                .build();

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPasswordAlice");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(3L);
            return u;
        });

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("ROLE_USER", response.getRole());
        assertEquals("USER", response.getAccountType());
        verify(userRepository, times(1)).save(any(User.class));
        verify(cartRepository, times(1)).save(any(com.easeshop.entity.Cart.class));
    }

    @Test
    void registerAdminFromPublicSignup_shouldThrowException() {
        // Arrange
        com.easeshop.dto.request.RegisterRequest request = com.easeshop.dto.request.RegisterRequest.builder()
                .name("Malicious Admin")
                .email("hacker@shopease.com")
                .password("password123")
                .accountType("ADMIN")
                .build();

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertEquals("Admin registration is not allowed from public signup.", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
        verify(cartRepository, never()).save(any(com.easeshop.entity.Cart.class));
    }
}
