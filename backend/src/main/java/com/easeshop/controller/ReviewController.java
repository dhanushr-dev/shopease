package com.easeshop.controller;

import com.easeshop.dto.request.ReviewRequest;
import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.ReviewResponse;
import com.easeshop.dto.response.ReviewSummaryResponse;
import com.easeshop.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product review and rating APIs")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/products/{productId}/reviews")
    @Operation(summary = "Create a review for a product")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.createReview(userDetails.getUsername(), productId, request);
        return ResponseEntity.ok(ApiResponse.success(review, "Review submitted successfully."));
    }

    @GetMapping("/api/products/{productId}/reviews")
    @Operation(summary = "Get all reviews for a product")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Reviews fetched"));
    }

    @GetMapping("/api/products/{productId}/rating-summary")
    @Operation(summary = "Get rating summary for a product")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getRatingSummary(@PathVariable Long productId) {
        ReviewSummaryResponse summary = reviewService.getReviewSummary(productId);
        return ResponseEntity.ok(ApiResponse.success(summary, "Rating summary fetched"));
    }

    @PutMapping("/api/reviews/{reviewId}")
    @Operation(summary = "Update own review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.updateReview(userDetails.getUsername(), reviewId, request);
        return ResponseEntity.ok(ApiResponse.success(review, "Review updated successfully."));
    }

    @DeleteMapping("/api/reviews/{reviewId}")
    @Operation(summary = "Delete own review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(userDetails.getUsername(), reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted."));
    }

    @DeleteMapping("/api/admin/reviews/{reviewId}")
    @Operation(summary = "Admin: Delete any review")
    public ResponseEntity<ApiResponse<Void>> adminDeleteReview(@PathVariable Long reviewId) {
        reviewService.adminDeleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted by admin."));
    }
}
