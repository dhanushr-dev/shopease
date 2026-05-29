package com.easeshop.service;

import com.easeshop.dto.request.LoginRequest;
import com.easeshop.dto.request.RegisterRequest;
import com.easeshop.dto.response.AuthResponse;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Registers a new user account.
     *
     * @param request the registration details
     * @return authentication response with JWT token
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request the login credentials
     * @return authentication response with JWT token
     */
    AuthResponse login(LoginRequest request);
}
