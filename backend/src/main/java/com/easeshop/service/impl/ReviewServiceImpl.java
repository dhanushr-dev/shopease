package com.easeshop.service.impl;

import com.easeshop.dto.request.ReviewRequest;
import com.easeshop.dto.response.ReviewResponse;
import com.easeshop.dto.response.ReviewSummaryResponse;
import com.easeshop.entity.OrderStatus;
import com.easeshop.entity.Review;
import com.easeshop.entity.Product;
import com.easeshop.entity.User;
import com.easeshop.exception.BadRequestException;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.OrderRepository;
import com.easeshop.repository.ProductRepository;
import com.easeshop.repository.ReviewRepository;
import com.easeshop.repository.UserRepository;
import com.easeshop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(String email, Long productId, ReviewRequest request) {
        User user = findUserByEmail(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("You already reviewed this product.");
        }

        // Check if user has purchased and received the product
        boolean hasPurchased = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (!hasPurchased) {
            throw new BadRequestException("You can review only purchased products.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);
        log.info("⭐ Review created for product {} by {}", product.getName(), email);
        return toResponse(review);
    }

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public ReviewSummaryResponse getReviewSummary(Long productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);
        List<Object[]> distribution = reviewRepository.getRatingDistribution(productId);

        Map<Integer, Long> ratingMap = new HashMap<>();
        for (int i = 1; i <= 5; i++) ratingMap.put(i, 0L);
        for (Object[] row : distribution) {
            ratingMap.put((Integer) row[0], (Long) row[1]);
        }

        return ReviewSummaryResponse.builder()
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .totalReviews(count)
                .ratingDistribution(ratingMap)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(String email, Long reviewId, ReviewRequest request) {
        User user = findUserByEmail(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own reviews.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);
        log.info("✏️ Review updated: id={}", reviewId);
        return toResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(String email, Long reviewId) {
        User user = findUserByEmail(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own reviews.");
        }

        reviewRepository.delete(review);
        log.info("🗑️ Review deleted: id={}", reviewId);
    }

    @Override
    @Transactional
    public void adminDeleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        reviewRepository.delete(review);
        log.info("🗑️ Admin deleted review: id={}", reviewId);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
