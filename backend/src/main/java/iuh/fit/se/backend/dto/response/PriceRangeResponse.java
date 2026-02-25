package iuh.fit.se.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PriceRangeResponse {
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}
