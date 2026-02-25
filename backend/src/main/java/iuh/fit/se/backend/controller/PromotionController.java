package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.ProductPromotionResponse;
import iuh.fit.se.backend.dto.PromotionRequest;
import iuh.fit.se.backend.dto.PromotionSummary;
import iuh.fit.se.backend.entity.Promotion;
import iuh.fit.se.backend.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductPromotionResponse>>> getAll() {
        List<ProductPromotionResponse> data = promotionService.getPromotionsGroupedByProduct();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/summaries")
    public ResponseEntity<ApiResponse<List<PromotionSummary>>> getSummaries(
            @RequestParam(value = "search", required = false) String search
    ) {
        List<PromotionSummary> data = promotionService.getPromotionSummaries(search);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionSummary>> getOne(@PathVariable Long id) {
        try {
            PromotionSummary summary = promotionService.getSummary(id);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .name(request.getName())
                .discount(request.getDiscount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        try {
            promotionService.save(promotion, request.resolveProductIds());
            return ResponseEntity.ok(ApiResponse.success("Promotion created"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Unable to create promotion"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .id(id)
                .name(request.getName())
                .discount(request.getDiscount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        try {
            promotionService.save(promotion, request.resolveProductIds());
            return ResponseEntity.ok(ApiResponse.success("Promotion updated"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Unable to update promotion"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        try {
            promotionService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Promotion deleted"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }
}
