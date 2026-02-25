package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.ReviewDeleteRequest;
import iuh.fit.se.backend.dto.request.ReviewRequest;
import iuh.fit.se.backend.dto.response.ReviewResponse;
import iuh.fit.se.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping
    public List<ReviewResponse> getAll() {
        return reviewService.getAll();
    }

    @GetMapping("/{id}")
    public ReviewResponse getOne(@PathVariable Long id) {
        return reviewService.get(id);
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponse> getByProduct(@PathVariable Long productId) {
        return reviewService.getByProduct(productId);
    }

    @GetMapping("/user/{userId}")
    public List<ReviewResponse> getByUser(@PathVariable Long userId) {
        return reviewService.getByUser(userId);
    }

    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<ReviewResponse> getByUserAndProduct(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        ReviewResponse review = reviewService.getByUserAndProduct(userId, productId);
        // Trả về 200 OK với null thay vì 404 - không có review là trường hợp bình thường
        // Điều này giúp frontend không bị log errors trong console
        return ResponseEntity.ok(review);
    }

    @PostMapping
    public ReviewResponse create(@Valid @RequestBody ReviewRequest dto) {
        return reviewService.createReview(dto);
    }

    @PutMapping("/{id}")
    public ReviewResponse update(@PathVariable Long id, @Valid @RequestBody ReviewRequest dto) {
        return reviewService.updateReview(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id,
                                                      @Valid @RequestBody ReviewDeleteRequest request) {
        reviewService.deleteReview(id, request.getReason());
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }
}
