package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.CustomerRevenuePoint;
import iuh.fit.se.backend.dto.RevenueDailyPoint;
import iuh.fit.se.backend.dto.RevenueMonthlyPoint;
import iuh.fit.se.backend.dto.RevenueSummaryReport;
import iuh.fit.se.backend.dto.RevenueYearlyPoint;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.service.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
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
public class RevenueReportServiceImpl implements RevenueReportService {

    private static final List<OrderStatus> REVENUE_STATUSES = List.of(
            OrderStatus.PAID,
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED
    );

    private static final int DEFAULT_CUSTOMER_LIMIT = 10;

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueSummaryReport getRevenueSummary() {
        BigDecimal totalRevenue = defaultZero(orderRepository.sumTotalRevenueByStatuses(REVENUE_STATUSES));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1).minusNanos(1);
        BigDecimal revenueToday = defaultZero(orderRepository.sumRevenueInRange(startOfToday, endOfToday, REVENUE_STATUSES));

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);
        BigDecimal revenueThisMonth = defaultZero(orderRepository.sumRevenueInRange(startOfMonth, endOfMonth, REVENUE_STATUSES));

        long totalPaidOrders = orderRepository.countByStatusIn(REVENUE_STATUSES);
        BigDecimal averageOrderValue = totalPaidOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalPaidOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new RevenueSummaryReport(
                totalRevenue,
                revenueThisMonth,
                revenueToday,
                totalPaidOrders,
                averageOrderValue
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueDailyPoint> getDailyRevenue(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }

        List<Object[]> rows = orderRepository.sumRevenueByDayRange(startDate, endDate, REVENUE_STATUSES);
        Map<LocalDate, BigDecimal> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = convertToLocalDate(row[0]);
            BigDecimal revenue = convertToBigDecimal(row[1]);
            aggregated.put(date, revenue);
        }

        List<RevenueDailyPoint> result = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        for (int i = 0; i <= days; i++) {
            LocalDate current = startDate.plusDays(i);
            BigDecimal revenue = aggregated.getOrDefault(current, BigDecimal.ZERO);
            result.add(new RevenueDailyPoint(current, revenue));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueMonthlyPoint> getMonthlyRevenue(int year) {
        List<Object[]> rows = orderRepository.sumRevenueByMonth(year, REVENUE_STATUSES);
        Map<Integer, BigDecimal> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            Integer month = convertToInteger(row[1]);
            BigDecimal revenue = convertToBigDecimal(row[2]);
            aggregated.put(month, revenue);
        }

        List<RevenueMonthlyPoint> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            BigDecimal revenue = aggregated.getOrDefault(month, BigDecimal.ZERO);
            result.add(new RevenueMonthlyPoint(month, revenue));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueYearlyPoint> getYearlyRevenue(int startYear, int endYear) {
        if (startYear > endYear) {
            throw new IllegalArgumentException("Start year must be before or equal to end year");
        }

        List<Object[]> rows = orderRepository.sumRevenueByYearRange(startYear, endYear, REVENUE_STATUSES);
        Map<Integer, BigDecimal> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            Integer year = convertToInteger(row[0]);
            BigDecimal revenue = convertToBigDecimal(row[1]);
            aggregated.put(year, revenue);
        }

        List<RevenueYearlyPoint> result = new ArrayList<>();
        for (int year = startYear; year <= endYear; year++) {
            BigDecimal revenue = aggregated.getOrDefault(year, BigDecimal.ZERO);
            result.add(new RevenueYearlyPoint(year, revenue));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerRevenuePoint> getCustomerRevenueByMonth(int year, int month, int limit) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }
        int sanitizedLimit = limit > 0 ? limit : DEFAULT_CUSTOMER_LIMIT;

        List<Object[]> rows = orderRepository.sumCustomerRevenueByMonth(year, month, REVENUE_STATUSES);
        return mapCustomerRevenue(rows, sanitizedLimit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerRevenuePoint> getCustomerRevenueByYear(int year, int limit) {
        int sanitizedLimit = limit > 0 ? limit : DEFAULT_CUSTOMER_LIMIT;
        List<Object[]> rows = orderRepository.sumCustomerRevenueByYear(year, REVENUE_STATUSES);
        return mapCustomerRevenue(rows, sanitizedLimit);
    }

    private List<CustomerRevenuePoint> mapCustomerRevenue(List<Object[]> rows, int limit) {
        List<CustomerRevenuePoint> result = new ArrayList<>();
        int count = 0;
        for (Object[] row : rows) {
            if (count >= limit) {
                break;
            }
            Long customerId = convertToLong(row[0]);
            String customerName = convertToString(row[1]);
            String email = convertToString(row[2]);
            BigDecimal revenue = convertToBigDecimal(row[3]);
            long orderCount = convertToLong(row[4]);
            result.add(new CustomerRevenuePoint(customerId, customerName, email, orderCount, revenue));
            count++;
        }
        return result;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private LocalDate convertToLocalDate(Object value) {
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

    private Integer convertToInteger(Object value) {
        if (value instanceof Integer intValue) {
            return intValue;
        }
        if (value instanceof Long longValue) {
            return longValue.intValue();
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        throw new IllegalArgumentException("Unsupported integer value: " + value);
    }

    private Long convertToLong(Object value) {
        if (value instanceof Long longValue) {
            return longValue;
        }
        if (value instanceof Integer intValue) {
            return intValue.longValue();
        }
        if (value instanceof BigInteger bigInteger) {
            return bigInteger.longValue();
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new IllegalArgumentException("Unsupported long value: " + value);
    }

    private BigDecimal convertToBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof BigInteger bigInteger) {
            return new BigDecimal(bigInteger);
        }
        if (value instanceof Long longValue) {
            return BigDecimal.valueOf(longValue);
        }
        if (value instanceof Integer intValue) {
            return BigDecimal.valueOf(intValue);
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        throw new IllegalArgumentException("Unsupported numeric value: " + value);
    }

    private String convertToString(Object value) {
        return value != null ? value.toString() : "";
    }
}
