package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionSummary {
    private Long id;
    private String name;
    private BigDecimal discount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<Long> productIds;
    private LocalDateTime createdAt;
}
