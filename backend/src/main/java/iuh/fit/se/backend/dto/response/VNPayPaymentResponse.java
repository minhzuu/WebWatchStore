package iuh.fit.se.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VNPayPaymentResponse {
    private String code;
    private String message;
    private String paymentUrl;
}
