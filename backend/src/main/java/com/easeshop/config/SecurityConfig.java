package com.easeshop.config;

import com.easeshop.security.CustomUserDetailsService;
import com.easeshop.security.JwtAuthenticationFilter;
import com.easeshop.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.LocalDateTime;

/**
 * Spring Security configuration for ShopEase.
 * Configures JWT-based stateless authentication with role-based access control.
 *
 * Role convention used throughout the application:
 *   - ROLE_USER  → regular customer (can browse, cart, order, profile)
 *   - ROLE_ADMIN → admin (can manage products, categories, orders, users)
 *
 * Authorization rules:
 *   - hasAuthority("ROLE_ADMIN") is used (NOT hasRole) because the
 *     GrantedAuthority stored is the full enum name "ROLE_ADMIN" / "ROLE_USER".
 *   - .anyRequest().authenticated() allows any logged-in user regardless of role.
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CorsConfig corsConfig;
    private final JwtUtil jwtUtil;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Creates the JwtAuthenticationFilter as a Spring Bean (not @Component)
     * so that Spring Boot does NOT auto-register it as a Servlet filter.
     * It is only used inside the Security filter chain.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("🔒 Configuring Spring Security with JWT Authentication");

        http
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)

                // Exception handling — proper 401 vs 403
                .exceptionHandling(ex -> ex
                        // 401: No token or invalid token (unauthenticated)
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("🚫 401 Unauthorized: {} {} — {}",
                                    request.getMethod(), request.getRequestURI(), authException.getMessage());
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Unauthorized: Please provide a valid JWT token\"," +
                                    "\"timestamp\":\"" + LocalDateTime.now() + "\"}"
                            );
                        })
                        // 403: Valid token but insufficient role
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            log.warn("🚫 403 Forbidden: {} {} — {}",
                                    request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Access Denied: You don't have permission to access this resource\"," +
                                    "\"timestamp\":\"" + LocalDateTime.now() + "\"}"
                            );
                        })
                )

                .authorizeHttpRequests(auth -> auth
                        // Public endpoints — no JWT required
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*/rating-summary").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/coupons/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/banners/active").permitAll()
                        // Swagger docs
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                "/v3/api-docs/**", "/api-docs/**").permitAll()
                        // Admin-only endpoints — must have ROLE_ADMIN authority
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        // All other /api/** endpoints — any authenticated user (ROLE_USER or ROLE_ADMIN)
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
