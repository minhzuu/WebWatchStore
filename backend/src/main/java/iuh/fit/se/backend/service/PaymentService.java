package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.PaymentSummary;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.Payment;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<PaymentSummary> getSummaries(String keyword) {
        // Get payment transactions from orders instead of payments table
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .filter(order -> matchesOrderKeyword(order, keyword))
                .sorted(Comparator.comparing(
                        Order::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::orderToSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentSummary getSummary(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return orderToSummary(order);
    }

    private PaymentSummary orderToSummary(Order order) {
        // Calculate total amount from order items
        BigDecimal totalAmount = order.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PaymentSummary(
                order.getId(), // Use order ID as payment ID
                order.getPaymentMethod(),
                totalAmount,
                order.getId(),
                Optional.ofNullable(order.getFullName()).orElse(order.getUser() != null ? order.getUser().getFullName() : null),
                order.getCreatedAt(),
                order.getUpdatedAt() // Use updated_at for payment timestamp
        );
    }

    private boolean matchesOrderKeyword(Order order, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String normalized = keyword.trim().toLowerCase(Locale.ROOT);

        if (order.getPaymentMethod() != null && order.getPaymentMethod().name().toLowerCase(Locale.ROOT).contains(normalized)) {
            return true;
        }

        if (order.getId() != null && String.valueOf(order.getId()).contains(normalized)) {
            return true;
        }

        if (order.getFullName() != null && order.getFullName().toLowerCase(Locale.ROOT).contains(normalized)) {
            return true;
        }

        if (order.getUser() != null && order.getUser().getFullName() != null 
            && order.getUser().getFullName().toLowerCase(Locale.ROOT).contains(normalized)) {
            return true;
        }

        return false;
    }
}
