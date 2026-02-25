package iuh.fit.se.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VNPayPaymentRequest {
    private Long orderId;
    private Long amount; // Optional: VNPay amount in VND, if null will calculate from order
    private String orderInfo;
    private String returnUrl;
}
