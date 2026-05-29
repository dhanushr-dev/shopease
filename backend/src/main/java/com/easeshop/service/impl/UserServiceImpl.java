package com.easeshop.service.impl;

import com.easeshop.dto.request.AddressRequest;
import com.easeshop.dto.request.UpdateProfileRequest;
import com.easeshop.dto.response.AddressResponse;
import com.easeshop.dto.response.UserResponse;
import com.easeshop.entity.Address;
import com.easeshop.entity.User;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.AddressRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.service.UserService;
import com.easeshop.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final DtoMapper mapper;

    @Override
    public UserResponse getProfile(String email) {
        User user = findUserByEmail(email);
        return mapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        user = userRepository.save(user);
        log.info("✅ Profile updated for: {}", email);
        return mapper.toUserResponse(user);
    }

    @Override
    public List<AddressResponse> getAddresses(String email) {
        User user = findUserByEmail(email);
        return addressRepository.findByUserId(user.getId()).stream()
                .map(mapper::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = findUserByEmail(email);

        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                    .ifPresent(addr -> { addr.setIsDefault(false); addressRepository.save(addr); });
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        address = addressRepository.save(address);
        log.info("✅ Address added for: {}", email);
        return mapper.toAddressResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = findUserByEmail(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getIsDefault() != null) address.setIsDefault(request.getIsDefault());

        address = addressRepository.save(address);
        log.info("✅ Address updated for: {}", email);
        return mapper.toAddressResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = findUserByEmail(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        addressRepository.delete(address);
        log.info("🗑️ Address deleted for: {}", email);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return findUserByEmail(email);
    }
}
