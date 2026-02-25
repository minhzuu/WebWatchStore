package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.InventoryDailyPoint;
import iuh.fit.se.backend.dto.InventoryMonthlyPoint;
import iuh.fit.se.backend.dto.InventorySummaryReport;
import iuh.fit.se.backend.dto.InventoryYearlyPoint;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import iuh.fit.se.backend.repository.InventoryRepository;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.service.InventoryReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
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
public class InventoryReportServiceImpl implements InventoryReportService {

    private static final List<OrderStatus> FULFILLED_STATUSES = List.of(
            OrderStatus.PAID,
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED
    );

    private static final int LOW_STOCK_THRESHOLD = 10;

    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public InventorySummaryReport getInventorySummary() {
        long totalSkus = inventoryRepository.count();
        long rawLowStock = inventoryRepository.countByStockLessThanEqual(LOW_STOCK_THRESHOLD);
        long outOfStock = inventoryRepository.countByStock(0);
        long lowStockSkus = Math.max(rawLowStock - outOfStock, 0);
        long totalUnits = defaultZero(inventoryRepository.sumTotalStock());
        long distinctProducts = defaultZero(inventoryRepository.countDistinctProducts());
        LocalDateTime lastUpdatedAt = inventoryRepository.findLatestUpdatedAt();

        double averageUnitsPerSku = totalSkus > 0
                ? Math.round(((double) totalUnits / totalSkus) * 10.0) / 10.0
                : 0.0;

        return InventorySummaryReport.builder()
                .totalTrackedSkus(totalSkus)
                .totalUnitsOnHand(totalUnits)
                .lowStockSkus(lowStockSkus)
                .outOfStockSkus(outOfStock)
                .averageUnitsPerSku(averageUnitsPerSku)
                .distinctProducts(distinctProducts)
                .lastUpdatedAt(lastUpdatedAt)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDailyPoint> getDailyInventory(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);

        List<Object[]> rows = orderRepository.sumUnitsSoldByDayRange(startDate, endDate, FULFILLED_STATUSES);
        Map<LocalDate, InventoryDailyPoint> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = convertToLocalDate(row[0]);
            long unitsSold = convertToLong(row[1]);
            long distinctProducts = convertToLong(row[2]);
            long ordersCount = convertToLong(row[3]);
            aggregated.put(date, InventoryDailyPoint.builder()
                    .date(date)
                    .unitsSold(unitsSold)
                    .distinctProductsSold(distinctProducts)
                    .ordersCount(ordersCount)
                    .build());
        }

        List<InventoryDailyPoint> result = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        for (int i = 0; i <= days; i++) {
            LocalDate current = startDate.plusDays(i);
            InventoryDailyPoint point = aggregated.get(current);
            if (point != null) {
                result.add(point);
            } else {
                result.add(InventoryDailyPoint.builder()
                        .date(current)
                        .unitsSold(0L)
                        .distinctProductsSold(0L)
                        .ordersCount(0L)
                        .build());
            }
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryMonthlyPoint> getMonthlyInventory(int year) {
        List<Object[]> rows = orderRepository.sumUnitsSoldByMonth(year, FULFILLED_STATUSES);
        Map<Integer, InventoryMonthlyPoint> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            Integer month = convertToInteger(row[1]);
            long unitsSold = convertToLong(row[2]);
            long distinctProducts = convertToLong(row[3]);
            aggregated.put(month, InventoryMonthlyPoint.builder()
                    .month(month)
                    .unitsSold(unitsSold)
                    .distinctProductsSold(distinctProducts)
                    .build());
        }

        List<InventoryMonthlyPoint> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            InventoryMonthlyPoint point = aggregated.get(month);
            if (point != null) {
                result.add(point);
            } else {
                result.add(InventoryMonthlyPoint.builder()
                        .month(month)
                        .unitsSold(0L)
                        .distinctProductsSold(0L)
                        .build());
            }
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryYearlyPoint> getYearlyInventory(int startYear, int endYear) {
        if (startYear > endYear) {
            throw new IllegalArgumentException("Start year must be before or equal to end year");
        }

        List<Object[]> rows = orderRepository.sumUnitsSoldByYearRange(startYear, endYear, FULFILLED_STATUSES);
        Map<Integer, InventoryYearlyPoint> aggregated = new HashMap<>();
        for (Object[] row : rows) {
            Integer year = convertToInteger(row[0]);
            long unitsSold = convertToLong(row[1]);
            long distinctProducts = convertToLong(row[2]);
            aggregated.put(year, InventoryYearlyPoint.builder()
                    .year(year)
                    .unitsSold(unitsSold)
                    .distinctProductsSold(distinctProducts)
                    .build());
        }

        List<InventoryYearlyPoint> result = new ArrayList<>();
        for (int year = startYear; year <= endYear; year++) {
            InventoryYearlyPoint point = aggregated.get(year);
            if (point != null) {
                result.add(point);
            } else {
                result.add(InventoryYearlyPoint.builder()
                        .year(year)
                        .unitsSold(0L)
                        .distinctProductsSold(0L)
                        .build());
            }
        }
        return result;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
    }

    private long defaultZero(Long value) {
        return value != null ? value : 0L;
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

    private long convertToLong(Object value) {
        if (value == null) {
            return 0L;
        }
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
        throw new IllegalArgumentException("Unsupported numeric value: " + value);
    }
}
