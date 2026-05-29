package com.easeshop.service;

import com.easeshop.dto.request.BannerRequest;
import com.easeshop.dto.response.BannerResponse;

import java.util.List;

public interface BannerService {
    BannerResponse createBanner(BannerRequest request);
    BannerResponse updateBanner(Long id, BannerRequest request);
    void deleteBanner(Long id);
    BannerResponse toggleBannerStatus(Long id);
    List<BannerResponse> getAllBanners();
    List<BannerResponse> getActiveBanners();
}
