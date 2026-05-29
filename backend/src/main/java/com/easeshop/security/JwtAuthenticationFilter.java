package com.easeshop.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter that intercepts every HTTP request,
 * extracts and validates the JWT token from the Authorization header,
 * and sets the Spring Security authentication context.
 *
 * NOTE: This is NOT a @Component. It is manually instantiated as a Bean
 * to prevent Spring Boot from auto-registering it as a Servlet filter
 * (which would cause it to run TWICE — once outside and once inside
 * the Security filter chain).
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String requestURI = request.getRequestURI();

        try {
            String jwt = extractTokenFromRequest(request);

            if (jwt != null) {
                log.debug("🔑 JWT token found for: {}", requestURI);

                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    String userEmail = jwtUtil.extractUsername(jwt);

                    if (userEmail != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                        if (jwtUtil.validateToken(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            authToken.setDetails(
                                    new WebAuthenticationDetailsSource().buildDetails(request)
                            );
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            log.debug("🔓 Authenticated user: {} [{}] for {}",
                                    userEmail, userDetails.getAuthorities(), requestURI);
                        } else {
                            log.warn("⚠️ JWT token validation failed for user: {}", userEmail);
                        }
                    } else {
                        log.warn("⚠️ Could not extract username from JWT token");
                    }
                }
            } else {
                log.trace("No JWT token in request: {}", requestURI);
            }
        } catch (Exception e) {
            log.error("❌ Cannot set user authentication for {}: {}", requestURI, e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT token from the Authorization header.
     * Expected format: "Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
