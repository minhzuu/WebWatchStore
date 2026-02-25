package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductPromotionResponse {
    private Long productId;
    private String productName;
    private List<PromotionSummary> promotions = new ArrayList<>();
}
