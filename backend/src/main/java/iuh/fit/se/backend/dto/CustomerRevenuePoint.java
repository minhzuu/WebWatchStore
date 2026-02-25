package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRevenuePoint {

    private Long customerId;
    private String customerName;
    private String email;
    private long orderCount;
    private BigDecimal totalRevenue;
}
