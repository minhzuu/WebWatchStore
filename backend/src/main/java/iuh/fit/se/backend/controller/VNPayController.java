package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.request.VNPayPaymentRequest;
import iuh.fit.se.backend.dto.response.VNPayPaymentResponse;
import iuh.fit.se.backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
@Slf4j
public class VNPayController {
    
    private final VNPayService vnPayService;

    @PostMapping("/create-payment")
    public ResponseEntity<ApiResponse<VNPayPaymentResponse>> createPayment(
            @RequestBody VNPayPaymentRequest request,
            HttpServletRequest httpRequest) {
        try {
            log.info("Creating VNPay payment for order: {}", request.getOrderId());
            VNPayPaymentResponse response = vnPayService.createPayment(request, httpRequest);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error creating VNPay payment", e);
            return ResponseEntity.ok(ApiResponse.failure("Error creating payment: " + e.getMessage()));
        }
    }

    @GetMapping("/payment-return")
    public ResponseEntity<ApiResponse<Map<String, String>>> paymentReturn(
            @RequestParam Map<String, String> params) {
        try {
            log.info("Processing VNPay payment return");
            Map<String, String> result = vnPayService.handlePaymentReturn(params);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error processing VNPay payment return", e);
            return ResponseEntity.ok(ApiResponse.failure("Error processing payment return: " + e.getMessage()));
        }
    }

    @PostMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIPN(@RequestParam Map<String, String> params) {
        try {
            log.info("Received VNPay IPN");
            Map<String, String> result = vnPayService.handlePaymentReturn(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error processing VNPay IPN", e);
            return ResponseEntity.ok(Map.of(
                "RspCode", "99",
                "Message", "Error: " + e.getMessage()
            ));
        }
    }
}
