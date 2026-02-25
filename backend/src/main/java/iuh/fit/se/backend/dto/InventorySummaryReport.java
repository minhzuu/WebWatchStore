package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySummaryReport {

    private long totalTrackedSkus;
    private long totalUnitsOnHand;
    private long lowStockSkus;
    private long outOfStockSkus;
    private double averageUnitsPerSku;
    private long distinctProducts;
    private LocalDateTime lastUpdatedAt;
}
