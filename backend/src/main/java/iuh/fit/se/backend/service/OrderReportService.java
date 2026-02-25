package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.OrderDailyPoint;
import iuh.fit.se.backend.dto.OrderMonthlyPoint;
import iuh.fit.se.backend.dto.OrderSummaryReport;
import iuh.fit.se.backend.dto.OrderUserSummary;
import iuh.fit.se.backend.dto.OrderYearlyPoint;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderReportService {

    OrderSummaryReport getOrderSummary();

    List<OrderDailyPoint> getDailyOrders(LocalDate startDate, LocalDate endDate);

    List<OrderMonthlyPoint> getMonthlyOrders(int year);

    List<OrderYearlyPoint> getYearlyOrders(int startYear, int endYear);

    List<OrderUserSummary> getOrdersByUser(LocalDateTime startDate, LocalDateTime endDate, int limit);
}
