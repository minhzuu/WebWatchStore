package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.ReviewRequest;
import iuh.fit.se.backend.dto.response.ReviewResponse;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.Review;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.ReviewRepository;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public List<ReviewResponse> getAll() {
        return reviewRepository.findAllWithUserAndProduct()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse get(Long id) {
        Review review = reviewRepository.findByIdWithUserAndProduct(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        return toResponse(review);
    }

    public List<ReviewResponse> getByProduct(Long productId) {
        return reviewRepository.findByProductIdWithUserAndProduct(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getByUser(Long userId) {
        return reviewRepository.findByUserIdWithUserAndProduct(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse getByUserAndProduct(Long userId, Long productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId)
                .map(this::toResponse)
                .orElse(null);
    }

    public ReviewResponse createReview(ReviewRequest dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        Review review = Review.builder()
                .comment(dto.getComment())
                .rating(dto.getRating())
                .user(user)
                .product(product)
                .build();

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public ReviewResponse updateReview(Long id, ReviewRequest dto) {
        Review review = reviewRepository.findByIdWithUserAndProduct(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        if (dto.getComment() != null) {
            review.setComment(dto.getComment());
        }
        review.setRating(dto.getRating());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            review.setUser(user);
        }

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
            review.setProduct(product);
        }

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public void deleteReview(Long id, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deletion reason is required");
        }

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        User user = review.getUser();
        Product product = review.getProduct();

        reviewRepository.delete(review);
        notificationService.createReviewDeletedNotification(user, product, reason.trim());
        log.info("Review {} deleted by admin. Reason: {}", id, reason.trim());
    }

    private ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }

        User user = review.getUser();
        Product product = review.getProduct();

        return ReviewResponse.builder()
                .id(review.getId())
                .comment(review.getComment())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .userFullName(user != null ? user.getFullName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .build();
    }
}
