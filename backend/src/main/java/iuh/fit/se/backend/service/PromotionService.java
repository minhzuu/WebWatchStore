package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.ProductPromotionResponse;
import iuh.fit.se.backend.dto.PromotionSummary;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.Promotion;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }

    public Optional<Promotion> get(Long id) {
        return promotionRepository.findById(id);
    }

    public Promotion save(Promotion promotion, List<Long> productIds) {
        ensureUniqueName(promotion);
        validatePromotion(promotion);
        
        boolean isNewPromotion = promotion.getId() == null;

        if (productIds != null) {
            List<Long> normalizedIds = productIds.stream()
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            if (normalizedIds.isEmpty()) {
                promotion.setProducts(Collections.emptyList());
            } else {
                List<Product> products = productRepository.findAllById(normalizedIds);
                if (products.size() != normalizedIds.size()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more products were not found");
                }
                promotion.setProducts(products);
            }
        } else if (promotion.getId() != null) {
            promotionRepository.findById(promotion.getId())
                    .map(Promotion::getProducts)
                    .ifPresent(promotion::setProducts);
        } else {
            promotion.setProducts(Collections.emptyList());
        }

        Promotion saved = promotionRepository.save(promotion);
        
        // Gửi thông báo cho tất cả users khi tạo promotion mới
        if (isNewPromotion) {
            String promotionDetails = String.format(
                "Giảm giá %s%% từ %s đến %s. Áp dụng cho %d sản phẩm!",
                saved.getDiscount(),
                saved.getStartDate(),
                saved.getEndDate(),
                saved.getProducts() != null ? saved.getProducts().size() : 0
            );
            notificationService.notifyAllUsers(
                "🎉 Khuyến mãi mới: " + saved.getName(),
                promotionDetails
            );
        }
        
        return saved;
    }

    private void ensureUniqueName(Promotion promotion) {
        String name = promotion.getName();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Promotion name is required");
        }

        boolean exists = promotion.getId() == null
                ? promotionRepository.existsByNameIgnoreCase(name)
                : promotionRepository.existsByNameIgnoreCaseAndIdNot(name, promotion.getId());

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Promotion name already exists");
        }
    }

    private void validatePromotion(Promotion promotion) {
        BigDecimal discount = promotion.getDiscount();
        if (discount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount is required");
        }
        if (discount.compareTo(BigDecimal.ZERO) <= 0 || discount.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount must be between 0 and 100");
        }
        if (promotion.getStartDate() == null || promotion.getEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date and end date are required");
        }
        if (promotion.getEndDate().isBefore(promotion.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must be after start date");
        }
    }

    public void delete(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found");
        }
        promotionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductPromotionResponse> getPromotionsGroupedByProduct() {
        Map<Long, ProductPromotionResponse> grouped = new LinkedHashMap<>();

        for (Promotion promotion : promotionRepository.findAll()) {
            PromotionSummary summary = toSummary(promotion);
            for (Product product : promotion.getProducts()) {
                ProductPromotionResponse response = grouped.computeIfAbsent(
                        product.getId(),
                        id -> new ProductPromotionResponse(id, product.getName(), new ArrayList<>())
                );
                response.getPromotions().add(summary);
            }
        }

        return new ArrayList<>(grouped.values());
    }

    @Transactional(readOnly = true)
    public List<PromotionSummary> getPromotionSummaries(String keyword) {
        List<Promotion> promotions;
        if (keyword != null && !keyword.isBlank()) {
            promotions = promotionRepository.findByNameContainingIgnoreCase(keyword.trim());
        } else {
            promotions = promotionRepository.findAll();
        }

        Comparator<Promotion> comparator = Comparator.comparing(
                Promotion::getStartDate,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).reversed();

        return promotions.stream()
                .sorted(comparator)
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PromotionSummary getSummary(Long id) {
        return promotionRepository.findById(id)
                .map(this::toSummary)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found"));
    }

    private PromotionSummary toSummary(Promotion promotion) {
        List<Long> productIds = promotion.getProducts() == null
                ? Collections.emptyList()
                : promotion.getProducts().stream()
                        .map(Product::getId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

        return new PromotionSummary(
                promotion.getId(),
                promotion.getName(),
                promotion.getDiscount(),
                promotion.getStartDate(),
                promotion.getEndDate(),
                productIds,
                promotion.getCreatedAt()
        );
    }
}
