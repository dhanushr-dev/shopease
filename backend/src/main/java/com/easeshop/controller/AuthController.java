package com.easeshop.controller;

import com.easeshop.dto.request.LoginRequest;
import com.easeshop.dto.request.RegisterRequest;
import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.AuthResponse;
import com.easeshop.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and login APIs")
public class AuthController {

    private final AuthService authService;
    private final com.easeshop.repository.UserRepository userRepository;
    private final com.easeshop.repository.CategoryRepository categoryRepository;
    private final com.easeshop.repository.ProductRepository productRepository;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("📝 Register request for: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("🔑 Login request for: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/debug")
    @Operation(summary = "Get debug database info")
    public ResponseEntity<?> getDebugInfo() {
        java.util.Map<String, Object> debugInfo = new java.util.HashMap<>();
        try {
            debugInfo.put("userCount", userRepository.count());
            debugInfo.put("categoryCount", categoryRepository.count());
            debugInfo.put("productCount", productRepository.count());
            debugInfo.put("activeProductCount", productRepository.countByActiveTrue());
            debugInfo.put("categories", categoryRepository.findAll().stream()
                .map(c -> c.getId() + ": " + c.getName())
                .collect(java.util.stream.Collectors.toList()));
            debugInfo.put("sampleProducts", productRepository.findAll().stream()
                .limit(5)
                .map(p -> p.getId() + ": " + p.getName() + " (Active=" + p.getActive() + ", CatId=" + p.getCategory().getId() + ")")
                .collect(java.util.stream.Collectors.toList()));
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            debugInfo.put("stackTrace", sw.toString());
        }
        return ResponseEntity.ok(debugInfo);
    }
}
