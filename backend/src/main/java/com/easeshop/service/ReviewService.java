package com.easeshop.service;

import com.easeshop.dto.request.ReviewRequest;
import com.easeshop.dto.response.ReviewResponse;
import com.easeshop.dto.response.ReviewSummaryResponse;
import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(String email, Long productId, ReviewRequest request);
    List<ReviewResponse> getProductReviews(Long productId);
    ReviewSummaryResponse getReviewSummary(Long productId);
    ReviewResponse updateReview(String email, Long reviewId, ReviewRequest request);
    void deleteReview(String email, Long reviewId);
    void adminDeleteReview(Long reviewId);
}
