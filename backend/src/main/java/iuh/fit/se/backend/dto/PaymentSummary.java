package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSummary {
    private Long id;
    private PaymentMethod method;
    private BigDecimal amount;
    private Long orderId;
    private String orderCustomerName;
    private LocalDateTime orderCreatedAt;
    private LocalDateTime createdAt;
}
