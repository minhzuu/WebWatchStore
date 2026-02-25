package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.CustomerDailySignupPoint;
import iuh.fit.se.backend.dto.CustomerMonthlySignupPoint;
import iuh.fit.se.backend.dto.CustomerSummaryReport;
import iuh.fit.se.backend.dto.CustomerYearlySignupPoint;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.CustomerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerReportServiceImpl implements CustomerReportService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CustomerSummaryReport getCustomerSummary() {
        long totalCustomers = userRepository.count();
        long activeCustomers = userRepository.countByActiveTrue();
        long inactiveCustomers = userRepository.countByActiveFalse();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1).minusNanos(1);
        long newCustomersToday = userRepository.countByCreatedAtBetween(startOfToday, endOfToday);

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);
        long newCustomersThisMonth = userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);

        return new CustomerSummaryReport(
                totalCustomers,
                activeCustomers,
                inactiveCustomers,
                newCustomersToday,
                newCustomersThisMonth
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDailySignupPoint> getDailySignups(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<Object[]> rows = userRepository.countNewUsersByDayRange(start, end);
        Map<LocalDate, Long> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = convertToLocalDate(row[0]);
            Long total = convertToLong(row[1]);
            aggregated.put(date, total);
        }

        List<CustomerDailySignupPoint> result = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        for (int i = 0; i <= days; i++) {
            LocalDate current = startDate.plusDays(i);
            long count = aggregated.getOrDefault(current, 0L);
            result.add(new CustomerDailySignupPoint(current, count));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerMonthlySignupPoint> getMonthlySignups(int year) {
        List<Object[]> rows = userRepository.countNewUsersByMonth(year);
        Map<Integer, Long> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            Integer month = convertToInteger(row[1]);
            Long total = convertToLong(row[2]);
            aggregated.put(month, total);
        }

        List<CustomerMonthlySignupPoint> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            long count = aggregated.getOrDefault(month, 0L);
            result.add(new CustomerMonthlySignupPoint(month, count));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerYearlySignupPoint> getYearlySignups(int startYear, int endYear) {
        if (startYear > endYear) {
            throw new IllegalArgumentException("Start year must be before or equal to end year");
        }

        List<Object[]> rows = userRepository.countNewUsersByYearRange(startYear, endYear);
        Map<Integer, Long> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            Integer year = convertToInteger(row[0]);
            Long total = convertToLong(row[1]);
            aggregated.put(year, total);
        }

        List<CustomerYearlySignupPoint> result = new ArrayList<>();
        for (int year = startYear; year <= endYear; year++) {
            long count = aggregated.getOrDefault(year, 0L);
            result.add(new CustomerYearlySignupPoint(year, count));
        }
        return result;
    }

    private LocalDate convertToLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toLocalDate();
        }
        throw new IllegalArgumentException("Unsupported date value: " + value);
    }

    private Long convertToLong(Object value) {
        if (value instanceof Long longValue) {
            return longValue;
        }
        if (value instanceof Integer intValue) {
            return intValue.longValue();
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new IllegalArgumentException("Unsupported numeric value: " + value);
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
}
