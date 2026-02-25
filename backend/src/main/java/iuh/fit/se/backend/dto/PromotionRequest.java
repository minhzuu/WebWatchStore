package iuh.fit.se.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Data
public class PromotionRequest {
    private Long id;
    private String name;
    private BigDecimal discount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<Long> productIds;
    private List<IdReference> products;

    public List<Long> resolveProductIds() {
        if (productIds != null) {
            return productIds;
        }
        if (products == null) {
            return null;
        }
        return products.stream()
                .map(IdReference::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Data
    public static class IdReference {
        private Long id;
    }
}
