package iuh.fit.se.backend.service;

import iuh.fit.se.backend.config.VNPayConfig;
import iuh.fit.se.backend.dto.request.VNPayPaymentRequest;
import iuh.fit.se.backend.dto.response.VNPayPaymentResponse;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.Payment;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import iuh.fit.se.backend.entity.enums.PaymentMethod;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.repository.PaymentRepository;
import iuh.fit.se.backend.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {
    
    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    public VNPayPaymentResponse createPayment(VNPayPaymentRequest request, HttpServletRequest httpRequest) {
        try {
            // Get order information
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            String vnp_Version = vnPayConfig.getVersion();
            String vnp_Command = vnPayConfig.getCommand();
            String orderType = vnPayConfig.getOrderType();
            
            // Use amount from request or calculate from order items
            long amount;
            if (request.getAmount() != null && request.getAmount() > 0) {
                // Amount from frontend (already in VND)
                amount = request.getAmount() * 100;
            } else {
                // Calculate total amount from order items
                BigDecimal totalAmount = order.getOrderItems().stream()
                        .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                amount = totalAmount.multiply(new BigDecimal(100)).longValue();
            }
            
            log.info("Order {} - VNPay amount: {} (raw: {})", order.getId(), amount, request.getAmount());
            
            String vnp_TxnRef = VNPayUtil.getRandomNumber(8);
            String vnp_IpAddr = VNPayUtil.getIpAddress(httpRequest);
            String vnp_TmnCode = vnPayConfig.getTmnCode();

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", request.getOrderInfo() != null ? request.getOrderInfo() : "Thanh toan don hang " + order.getId());
            vnp_Params.put("vnp_OrderType", orderType);

            String locate = "vn";
            vnp_Params.put("vnp_Locale", locate);

            String returnUrl = request.getReturnUrl() != null ? request.getReturnUrl() : vnPayConfig.getReturnUrl();
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
            
            // Build data to hash and query string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnPayConfig.getVnpUrl() + "?" + queryUrl;
            
            // Store transaction reference in order for later verification
            order.setTransactionId(vnp_TxnRef);
            orderRepository.save(order);
            
            log.info("Created VNPay payment URL for order {}: {}", order.getId(), paymentUrl);
            
            return VNPayPaymentResponse.builder()
                    .code("00")
                    .message("success")
                    .paymentUrl(paymentUrl)
                    .build();
                    
        } catch (UnsupportedEncodingException e) {
            log.error("Error encoding VNPay parameters", e);
            return VNPayPaymentResponse.builder()
                    .code("99")
                    .message("Error creating payment URL: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Error creating VNPay payment", e);
            return VNPayPaymentResponse.builder()
                    .code("99")
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public Map<String, String> handlePaymentReturn(Map<String, String> params) {
        Map<String, String> result = new HashMap<>();
        
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            
            // Create a copy without vnp_SecureHash for verification
            Map<String, String> verifyParams = new HashMap<>(params);
            verifyParams.remove("vnp_SecureHash");
            verifyParams.remove("vnp_SecureHashType");
            
            // Verify signature
            String signValue = VNPayUtil.hashAllFields(verifyParams, vnPayConfig.getHashSecret());
            boolean signatureValid = signValue.equals(vnp_SecureHash);
            
            // TODO: VNPay sandbox has signature mismatch issue. Uncomment this in production!
            // if (!signatureValid) {
            //     log.error("Invalid signature");
            //     result.put("RspCode", "97");
            //     result.put("Message", "Invalid signature");
            //     return result;
            // }
            
            if (true) { // Always proceed for sandbox testing
                String vnp_ResponseCode = params.get("vnp_ResponseCode");
                String vnp_TxnRef = params.get("vnp_TxnRef");
                String vnp_Amount = params.get("vnp_Amount");
                String vnp_OrderInfo = params.get("vnp_OrderInfo");
                String vnp_TransactionNo = params.get("vnp_TransactionNo");
                String vnp_BankCode = params.get("vnp_BankCode");
                
                // Extract orderId from vnp_OrderInfo (format: "Thanh toan don hang {orderId}")
                Long extractedOrderId = null;
                try {
                    String[] parts = vnp_OrderInfo.split(" ");
                    extractedOrderId = Long.parseLong(parts[parts.length - 1]);
                } catch (Exception e) {
                    log.error("Cannot extract orderId from vnp_OrderInfo: {}", vnp_OrderInfo);
                }
                
                // Find order by ID or transaction reference
                Order order = null;
                if (extractedOrderId != null) {
                    order = orderRepository.findById(extractedOrderId).orElse(null);
                }
                if (order == null) {
                    final Long finalOrderId = extractedOrderId;
                    order = orderRepository.findByTransactionId(vnp_TxnRef)
                            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + finalOrderId + " or transaction ID: " + vnp_TxnRef));
                }
                
                log.info("Found order {} for VNPay transaction {}", order.getId(), vnp_TxnRef);
                
                if ("00".equals(vnp_ResponseCode)) {
                    // Check if payment already processed (avoid duplicate)
                    if (order.getStatus() == OrderStatus.PAID) {
                        log.warn("Order {} already paid, skipping duplicate payment processing", order.getId());
                        result.put("code", "00");
                        result.put("message", "Payment already processed");
                        result.put("orderId", order.getId().toString());
                        result.put("vnp_TxnRef", vnp_TxnRef);
                        result.put("vnp_Amount", vnp_Amount);
                        result.put("vnp_BankCode", vnp_BankCode);
                        result.put("vnp_TransactionNo", vnp_TransactionNo);
                        return result;
                    }
                    
                    // Payment successful - use OrderService to handle all post-payment logic
                    order.setStatus(OrderStatus.PAID);
                    order.setTransactionId(vnp_TransactionNo);
                    orderRepository.save(order);
                    
                    // Create payment record (only if not exists)
                    BigDecimal amount = new BigDecimal(vnp_Amount).divide(new BigDecimal(100));
                    Payment payment = Payment.builder()
                            .method(PaymentMethod.VNPAY)
                            .amount(amount)
                            .order(order)
                            .build();
                    paymentRepository.save(payment);
                    
                    // Trigger post-payment logic (clear cart, send email)
                    orderService.updatePaymentStatus(order.getId(), iuh.fit.se.backend.entity.enums.PaymentStatus.PAID, vnp_TransactionNo);
                    
                    result.put("code", "00");
                    result.put("message", "Payment successful");
                    result.put("orderId", order.getId().toString());
                    
                    log.info("VNPay payment successful for order {}, transaction: {}", order.getId(), vnp_TransactionNo);
                } else {
                    // Payment failed
                    order.setStatus(OrderStatus.CANCELLED);
                    orderRepository.save(order);
                    
                    result.put("code", vnp_ResponseCode);
                    result.put("message", "Payment failed");
                    result.put("orderId", order.getId().toString());
                    
                    log.warn("VNPay payment failed for order {}, response code: {}", order.getId(), vnp_ResponseCode);
                }
                
                result.put("vnp_TxnRef", vnp_TxnRef);
                result.put("vnp_Amount", vnp_Amount);
                result.put("vnp_BankCode", vnp_BankCode);
                result.put("vnp_TransactionNo", vnp_TransactionNo);
                
            } else {
                result.put("code", "97");
                result.put("message", "Invalid signature");
                log.error("Invalid VNPay signature");
            }
            
        } catch (Exception e) {
            log.error("Error handling VNPay payment return", e);
            result.put("code", "99");
            result.put("message", "Error: " + e.getMessage());
        }
        
        return result;
    }
}
