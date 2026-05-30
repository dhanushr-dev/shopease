package com.easeshop.service.impl;

import com.easeshop.dto.request.LoginRequest;
import com.easeshop.dto.request.RegisterRequest;
import com.easeshop.dto.response.AuthResponse;
import com.easeshop.entity.Cart;
import com.easeshop.entity.Role;
import com.easeshop.entity.User;
import com.easeshop.exception.BadRequestException;
import com.easeshop.repository.CartRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.security.JwtUtil;
import com.easeshop.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of AuthService handling user registration and login.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("📝 Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        if ("ADMIN".equalsIgnoreCase(request.getAccountType()) || "SELLER".equalsIgnoreCase(request.getAccountType())) {
            throw new BadRequestException("Admin registration is not allowed from public signup.");
        }
        Role assignedRole = Role.ROLE_USER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .phone(request.getPhone())
                .build();

        user = userRepository.save(user);

        // Create an empty cart for the new user
        cartRepository.save(Cart.builder().user(user).build());

        log.info("✅ User registered successfully: {}", user.getEmail());

        // Generate JWT token
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                java.util.Collections.singletonList(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name())
                )
        );

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());

        String token = jwtUtil.generateToken(claims, userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountType(user.getRole() == Role.ROLE_ADMIN ? "ADMIN" : "USER")
                .build();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("🔑 Login attempt for: {}", request.getEmail());

        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadRequestException("No account found with this email. Please register first."));

            boolean isRequestedAdmin = "ADMIN".equalsIgnoreCase(request.getAccountType()) || "SELLER".equalsIgnoreCase(request.getAccountType());
            boolean isActualAdmin = user.getRole() == Role.ROLE_ADMIN;

            if (isRequestedAdmin && !isActualAdmin) {
                throw new BadRequestException("This email is registered as User. Please select User login.");
            } else if (!isRequestedAdmin && isActualAdmin) {
                throw new BadRequestException("This email is registered as Seller/Admin. Please select Seller/Admin login.");
            }

            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                );
            } catch (BadCredentialsException e) {
                throw new BadRequestException("Incorrect password. Please try again.");
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("role", user.getRole().name());

            String token = jwtUtil.generateToken(claims, userDetails);

            log.info("✅ User logged in successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .accountType(user.getRole() == Role.ROLE_ADMIN ? "ADMIN" : "USER")
                    .build();

        } catch (BadRequestException e) {
            log.warn("❌ Login validation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Login failed for: {}", request.getEmail(), e);
            throw new BadRequestException("Invalid email or password");
        }
    }
}
