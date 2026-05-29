package com.easeshop.service.impl;

import com.easeshop.dto.request.CategoryRequest;
import com.easeshop.dto.response.CategoryResponse;
import com.easeshop.entity.Category;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.CategoryRepository;
import com.easeshop.service.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final DtoMapper mapper;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllActiveCategories().stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category already exists: " + request.getName());
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        category = categoryRepository.save(category);
        log.info("✅ Category created: {}", category.getName());
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) category.setActive(request.getActive());
        category = categoryRepository.save(category);
        log.info("✅ Category updated: {}", category.getName());
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            category.setActive(false);
            categoryRepository.save(category);
            log.info("🗑️ Category deactivated (soft-delete): {}", category.getName());
        } else {
            categoryRepository.delete(category);
            log.info("🗑️ Category deleted: {}", category.getName());
        }
    }
}
