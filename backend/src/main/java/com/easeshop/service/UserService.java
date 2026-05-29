package com.easeshop.service;

import com.easeshop.dto.request.AddressRequest;
import com.easeshop.dto.request.UpdateProfileRequest;
import com.easeshop.dto.response.AddressResponse;
import com.easeshop.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    /** Gets the profile of the authenticated user. */
    UserResponse getProfile(String email);
    /** Updates user profile. */
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    /** Gets all addresses for a user. */
    List<AddressResponse> getAddresses(String email);
    /** Adds a new address. */
    AddressResponse addAddress(String email, AddressRequest request);
    /** Updates an address. */
    AddressResponse updateAddress(String email, Long addressId, AddressRequest request);
    /** Deletes an address. */
    void deleteAddress(String email, Long addressId);
    /** Gets all users (admin). */
    List<UserResponse> getAllUsers();
    /** Gets the currently authenticated user entity. */
    com.easeshop.entity.User getCurrentUser();
}
