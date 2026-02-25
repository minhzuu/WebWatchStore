package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderUserSummary {

    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private long ordersCount;
    private long totalUnits;
    private BigDecimal totalAmount;
    private LocalDateTime latestOrderAt;
}
