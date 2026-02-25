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
public class OrderSummaryReport {

    private long totalOrders;
    private long ordersThisMonth;
    private long ordersToday;
    private long fulfilledOrders;
    private long pendingOrders;
    private long cancelledOrders;
    private LocalDateTime lastOrderAt;
}
