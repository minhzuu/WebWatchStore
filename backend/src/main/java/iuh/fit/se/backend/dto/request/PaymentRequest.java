package iuh.fit.se.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private Long orderId;
    private long amount;
    private String orderInfo;
    private String bankCode; // NCB, VNPAYQR, VNBANK, INTCARD
}
