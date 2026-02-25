package iuh.fit.se.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    private Long productId;
    private int quantity;
    /** Optional: final unit price to snapshot (useful when frontend applies discounts) */
    private BigDecimal price;
}
