package com.easeshop.controller;

import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.BannerResponse;
import com.easeshop.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Public Banner APIs")
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/active")
    @Operation(summary = "Get active banners for homepage")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        List<BannerResponse> banners = bannerService.getActiveBanners();
        return ResponseEntity.ok(ApiResponse.success(banners, "Active banners fetched"));
    }
}
