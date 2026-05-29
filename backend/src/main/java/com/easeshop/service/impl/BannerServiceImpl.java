package com.easeshop.service.impl;

import com.easeshop.dto.request.BannerRequest;
import com.easeshop.dto.response.BannerResponse;
import com.easeshop.entity.Banner;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.BannerRepository;
import com.easeshop.service.BannerService;
import com.easeshop.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final DtoMapper mapper;

    @Override
    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .imageUrl(request.getImageUrl())
                .buttonText(request.getButtonText())
                .buttonLink(request.getButtonLink())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        
        banner = bannerRepository.save(banner);
        log.info("✅ Banner created: {}", banner.getTitle());
        return mapper.toBannerResponse(banner);
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
                
        banner.setTitle(request.getTitle());
        banner.setSubtitle(request.getSubtitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setButtonText(request.getButtonText());
        banner.setButtonLink(request.getButtonLink());
        if (request.getActive() != null) {
            banner.setActive(request.getActive());
        }
        
        banner = bannerRepository.save(banner);
        log.info("✅ Banner updated: {}", banner.getTitle());
        return mapper.toBannerResponse(banner);
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        bannerRepository.delete(banner);
        log.info("🗑️ Banner deleted: {}", id);
    }

    @Override
    @Transactional
    public BannerResponse toggleBannerStatus(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        banner.setActive(!banner.getActive());
        banner = bannerRepository.save(banner);
        log.info("✅ Banner status toggled: {} -> {}", banner.getTitle(), banner.getActive());
        return mapper.toBannerResponse(banner);
    }

    @Override
    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAll().stream()
                .map(mapper::toBannerResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(mapper::toBannerResponse)
                .collect(Collectors.toList());
    }
}
