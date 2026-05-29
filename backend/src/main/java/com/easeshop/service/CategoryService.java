package com.easeshop.service;

import com.easeshop.dto.request.CategoryRequest;
import com.easeshop.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    /** Gets all categories including inactive ones (admin). */
    List<CategoryResponse> getAllCategoriesAdmin();
    /** Gets a category by ID. */
    CategoryResponse getCategoryById(Long id);
    /** Creates a new category (admin). */
    CategoryResponse createCategory(CategoryRequest request);
    /** Updates a category (admin). */
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    /** Deletes a category (admin). */
    void deleteCategory(Long id);
}
