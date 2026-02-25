package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDailyPoint {

    private LocalDate date;
    private long totalOrders;
    private long fulfilledOrders;
    private long pendingOrders;
    private long cancelledOrders;
}
