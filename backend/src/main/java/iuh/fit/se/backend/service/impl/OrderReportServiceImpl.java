package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.OrderDailyPoint;
import iuh.fit.se.backend.dto.OrderMonthlyPoint;
import iuh.fit.se.backend.dto.OrderSummaryReport;
import iuh.fit.se.backend.dto.OrderUserSummary;
import iuh.fit.se.backend.dto.OrderYearlyPoint;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.service.OrderReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderReportServiceImpl implements OrderReportService {

    private static final List<OrderStatus> FULFILLED_STATUSES = List.of(
            OrderStatus.PAID,
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED
    );

    private static final OrderStatus PENDING_STATUS = OrderStatus.PENDING;
    private static final OrderStatus CANCELLED_STATUS = OrderStatus.CANCELLED;

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public OrderSummaryReport getOrderSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1).minusNanos(1);

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);

        long totalOrders = orderRepository.count();
        long ordersToday = orderRepository.countByCreatedAtBetween(startOfToday, endOfToday);
        long ordersThisMonth = orderRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);

        long fulfilledOrders = orderRepository.countByStatusIn(FULFILLED_STATUSES);
        long pendingOrders = orderRepository.countByStatus(PENDING_STATUS);
        long cancelledOrders = orderRepository.countByStatus(CANCELLED_STATUS);

        LocalDateTime lastOrderAt = orderRepository.findLastOrderTimestamp();

        OrderSummaryReport report = new OrderSummaryReport();
        report.setTotalOrders(totalOrders);
        report.setOrdersToday(ordersToday);
        report.setOrdersThisMonth(ordersThisMonth);
        report.setFulfilledOrders(fulfilledOrders);
        report.setPendingOrders(pendingOrders);
        report.setCancelledOrders(cancelledOrders);
        report.setLastOrderAt(lastOrderAt);
        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDailyPoint> getDailyOrders(LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);

        List<Object[]> rows = orderRepository.countOrdersByDayRange(
                startDate,
                endDate,
                FULFILLED_STATUSES,
                PENDING_STATUS,
                CANCELLED_STATUS
        );
        Map<LocalDate, OrderDailyPoint> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = toLocalDate(row[0]);
            long totalOrders = toLong(row[1]);
            long fulfilledOrders = toLong(row[2]);
            long pendingOrders = toLong(row[3]);
            long cancelledOrders = toLong(row[4]);
            OrderDailyPoint point = new OrderDailyPoint();
            point.setDate(date);
            point.setTotalOrders(totalOrders);
            point.setFulfilledOrders(fulfilledOrders);
            point.setPendingOrders(pendingOrders);
            point.setCancelledOrders(cancelledOrders);
            aggregated.put(date, point);
        }

        List<OrderDailyPoint> result = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        for (int i = 0; i <= days; i++) {
            LocalDate current = startDate.plusDays(i);
            OrderDailyPoint point = aggregated.get(current);
            if (point == null) {
                point = new OrderDailyPoint();
                point.setDate(current);
                point.setTotalOrders(0L);
                point.setFulfilledOrders(0L);
                point.setPendingOrders(0L);
                point.setCancelledOrders(0L);
            }
            result.add(point);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderMonthlyPoint> getMonthlyOrders(int year) {
        List<Object[]> rows = orderRepository.countOrdersByMonth(
                year,
                FULFILLED_STATUSES,
                PENDING_STATUS,
                CANCELLED_STATUS
        );
        Map<Integer, OrderMonthlyPoint> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            int month = toInt(row[1]);
            long totalOrders = toLong(row[2]);
            long fulfilledOrders = toLong(row[3]);
            long pendingOrders = toLong(row[4]);
            long cancelledOrders = toLong(row[5]);
            OrderMonthlyPoint point = new OrderMonthlyPoint();
            point.setMonth(month);
            point.setTotalOrders(totalOrders);
            point.setFulfilledOrders(fulfilledOrders);
            point.setPendingOrders(pendingOrders);
            point.setCancelledOrders(cancelledOrders);
            aggregated.put(month, point);
        }

        List<OrderMonthlyPoint> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            OrderMonthlyPoint point = aggregated.get(month);
            if (point == null) {
                point = new OrderMonthlyPoint();
                point.setMonth(month);
                point.setTotalOrders(0L);
                point.setFulfilledOrders(0L);
                point.setPendingOrders(0L);
                point.setCancelledOrders(0L);
            }
            result.add(point);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderYearlyPoint> getYearlyOrders(int startYear, int endYear) {
        if (startYear > endYear) {
            throw new IllegalArgumentException("Start year must be before or equal to end year");
        }

        List<Object[]> rows = orderRepository.countOrdersByYearRange(
                startYear,
                endYear,
                FULFILLED_STATUSES,
                PENDING_STATUS,
                CANCELLED_STATUS
        );
        Map<Integer, OrderYearlyPoint> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            int year = toInt(row[0]);
            long totalOrders = toLong(row[1]);
            long fulfilledOrders = toLong(row[2]);
            long pendingOrders = toLong(row[3]);
            long cancelledOrders = toLong(row[4]);
            OrderYearlyPoint point = new OrderYearlyPoint();
            point.setYear(year);
            point.setTotalOrders(totalOrders);
            point.setFulfilledOrders(fulfilledOrders);
            point.setPendingOrders(pendingOrders);
            point.setCancelledOrders(cancelledOrders);
            aggregated.put(year, point);
        }

        List<OrderYearlyPoint> result = new ArrayList<>();
        for (int year = startYear; year <= endYear; year++) {
            OrderYearlyPoint point = aggregated.get(year);
            if (point == null) {
                point = new OrderYearlyPoint();
                point.setYear(year);
                point.setTotalOrders(0L);
                point.setFulfilledOrders(0L);
                point.setPendingOrders(0L);
                point.setCancelledOrders(0L);
            }
            result.add(point);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderUserSummary> getOrdersByUser(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        int resolvedLimit = limit > 0 ? limit : 10;
        List<Object[]> rows = orderRepository.summarizeOrdersByUser(startDate, endDate);
        List<OrderUserSummary> result = new ArrayList<>();
        int index = 0;
        for (Object[] row : rows) {
            if (index >= resolvedLimit) {
                break;
            }
            Long userId = toLong(row[0]);
            String username = row[1] != null ? row[1].toString() : null;
            String fullName = row[2] != null ? row[2].toString() : null;
            String email = row[3] != null ? row[3].toString() : null;
            long ordersCount = toLong(row[4]);
            long totalUnits = toLong(row[5]);
            BigDecimal totalAmount = toBigDecimal(row[6]);
            LocalDateTime latestOrderAt = toLocalDateTime(row[7]);

            OrderUserSummary summary = OrderUserSummary.builder()
                    .userId(userId)
                    .username(username)
                    .fullName(fullName)
                    .email(email)
                    .ordersCount(ordersCount)
                    .totalUnits(totalUnits)
                    .totalAmount(totalAmount)
                    .latestOrderAt(latestOrderAt)
                    .build();
            result.add(summary);
            index++;
        }
        return result;
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
    }

    private long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return 0L;
    }

    private int toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return 0;
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toLocalDate();
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime().toLocalDate();
        }
        throw new IllegalArgumentException("Unsupported date value: " + value);
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        throw new IllegalArgumentException("Unsupported numeric value: " + value);
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof LocalDate localDate) {
            return localDate.atStartOfDay();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate().atStartOfDay();
        }
        throw new IllegalArgumentException("Unsupported datetime value: " + value);
    }
}
