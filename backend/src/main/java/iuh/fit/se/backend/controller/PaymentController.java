package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.request.VNPayPaymentRequest;
import iuh.fit.se.backend.dto.response.VNPayPaymentResponse;
import iuh.fit.se.backend.dto.PaymentSummary;
import iuh.fit.se.backend.entity.enums.PaymentMethod;
import iuh.fit.se.backend.entity.enums.PaymentStatus;
import iuh.fit.se.backend.service.OrderService;
import iuh.fit.se.backend.service.PaymentService;
import iuh.fit.se.backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final OrderService orderService;

    @PostMapping("/create-payment")
    public ResponseEntity<ApiResponse<VNPayPaymentResponse>> createPayment(
            @RequestBody VNPayPaymentRequest paymentRequest,
            HttpServletRequest request) {
        try {
            VNPayPaymentResponse response = vnPayService.createPayment(paymentRequest, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.failure("Error: " + e.getMessage()));
        }
    }


    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<Map<String, String>>> paymentReturn(@RequestParam Map<String, String> params) {
        try {
            Map<String, String> result = vnPayService.handlePaymentReturn(params);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.failure("Error processing payment: " + e.getMessage()));
        }
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> paymentIPN(@RequestParam Map<String, String> params) {
        try {
            Map<String, String> result = vnPayService.handlePaymentReturn(params);
            
            // IPN response format for VNPay
            Map<String, String> ipnResponse = new HashMap<>();
            if ("success".equals(result.get("status"))) {
                ipnResponse.put("RspCode", "00");
                ipnResponse.put("Message", "Confirm Success");
            } else {
                ipnResponse.put("RspCode", "97");
                ipnResponse.put("Message", result.getOrDefault("message", "Invalid Signature"));
            }
            
            return ResponseEntity.ok(ipnResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("RspCode", "99");
            errorResponse.put("Message", "System Error");
            return ResponseEntity.ok(errorResponse);
        }
    }



    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentSummary>>> getAllPayments(
            @RequestParam(value = "search", required = false) String search
    ) {
        List<PaymentSummary> data = paymentService.getSummaries(search);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentSummary>> getPaymentById(@PathVariable Long id) {
        try {
            PaymentSummary summary = paymentService.getSummary(id);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<List<PaymentMethod>>> getPaymentMethods() {
        return ResponseEntity.ok(ApiResponse.success(Arrays.asList(PaymentMethod.values())));
    }
}
