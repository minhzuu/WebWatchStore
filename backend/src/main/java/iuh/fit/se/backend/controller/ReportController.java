package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.CustomerDailySignupPoint;
import iuh.fit.se.backend.dto.CustomerMonthlySignupPoint;
import iuh.fit.se.backend.dto.CustomerRevenuePoint;
import iuh.fit.se.backend.dto.CustomerSummaryReport;
import iuh.fit.se.backend.dto.CustomerYearlySignupPoint;
import iuh.fit.se.backend.dto.InventoryDailyPoint;
import iuh.fit.se.backend.dto.InventoryMonthlyPoint;
import iuh.fit.se.backend.dto.InventorySummaryReport;
import iuh.fit.se.backend.dto.InventoryYearlyPoint;
import iuh.fit.se.backend.dto.OrderDailyPoint;
import iuh.fit.se.backend.dto.OrderMonthlyPoint;
import iuh.fit.se.backend.dto.OrderSummaryReport;
import iuh.fit.se.backend.dto.OrderUserSummary;
import iuh.fit.se.backend.dto.OrderYearlyPoint;
import iuh.fit.se.backend.dto.RevenueDailyPoint;
import iuh.fit.se.backend.dto.RevenueMonthlyPoint;
import iuh.fit.se.backend.dto.RevenueSummaryReport;
import iuh.fit.se.backend.dto.RevenueYearlyPoint;
import iuh.fit.se.backend.service.CustomerReportService;
import iuh.fit.se.backend.service.InventoryReportService;
import iuh.fit.se.backend.service.OrderReportService;
import iuh.fit.se.backend.service.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final CustomerReportService customerReportService;
    private final RevenueReportService revenueReportService;
    private final InventoryReportService inventoryReportService;
    private final OrderReportService orderReportService;

    @GetMapping("/customers/summary")
    public ResponseEntity<ApiResponse<CustomerSummaryReport>> getCustomerSummary() {
        CustomerSummaryReport summary = customerReportService.getCustomerSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/orders/summary")
    public ResponseEntity<ApiResponse<OrderSummaryReport>> getOrderSummary() {
        OrderSummaryReport summary = orderReportService.getOrderSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/inventory/summary")
    public ResponseEntity<ApiResponse<InventorySummaryReport>> getInventorySummary() {
        InventorySummaryReport summary = inventoryReportService.getInventorySummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/customers/daily")
    public ResponseEntity<ApiResponse<List<CustomerDailySignupPoint>>> getCustomerDailyReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate defaultEnd = endDate != null ? endDate : today;
            LocalDate defaultStart = startDate != null ? startDate : defaultEnd.minusDays(6);

            List<CustomerDailySignupPoint> data = customerReportService.getDailySignups(defaultStart, defaultEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/inventory/daily")
    public ResponseEntity<ApiResponse<List<InventoryDailyPoint>>> getInventoryDailyReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate resolvedEnd = endDate != null ? endDate : today;
            LocalDate resolvedStart = startDate != null ? startDate : resolvedEnd.minusDays(6);

            List<InventoryDailyPoint> data = inventoryReportService.getDailyInventory(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/orders/daily")
    public ResponseEntity<ApiResponse<List<OrderDailyPoint>>> getOrderDailyReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate resolvedEnd = endDate != null ? endDate : today;
            LocalDate resolvedStart = startDate != null ? startDate : resolvedEnd.minusDays(6);

            List<OrderDailyPoint> data = orderReportService.getDailyOrders(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/customers/monthly")
    public ResponseEntity<ApiResponse<List<CustomerMonthlySignupPoint>>> getCustomerMonthlyReport(
            @RequestParam(value = "year", required = false) Integer year
    ) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<CustomerMonthlySignupPoint> data = customerReportService.getMonthlySignups(targetYear);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/inventory/monthly")
    public ResponseEntity<ApiResponse<List<InventoryMonthlyPoint>>> getInventoryMonthlyReport(
            @RequestParam(value = "year", required = false) Integer year
    ) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<InventoryMonthlyPoint> data = inventoryReportService.getMonthlyInventory(targetYear);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/orders/monthly")
    public ResponseEntity<ApiResponse<List<OrderMonthlyPoint>>> getOrderMonthlyReport(
            @RequestParam(value = "year", required = false) Integer year
    ) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<OrderMonthlyPoint> data = orderReportService.getMonthlyOrders(targetYear);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/customers/yearly")
    public ResponseEntity<ApiResponse<List<CustomerYearlySignupPoint>>> getCustomerYearlyReport(
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear
    ) {
        int currentYear = Year.now().getValue();
        int resolvedStart = startYear != null ? startYear : currentYear - 4;
        int resolvedEnd = endYear != null ? endYear : currentYear;

        try {
            List<CustomerYearlySignupPoint> data = customerReportService.getYearlySignups(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/inventory/yearly")
    public ResponseEntity<ApiResponse<List<InventoryYearlyPoint>>> getInventoryYearlyReport(
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear
    ) {
        int currentYear = Year.now().getValue();
        int resolvedStart = startYear != null ? startYear : currentYear - 4;
        int resolvedEnd = endYear != null ? endYear : currentYear;

        try {
            List<InventoryYearlyPoint> data = inventoryReportService.getYearlyInventory(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/orders/yearly")
    public ResponseEntity<ApiResponse<List<OrderYearlyPoint>>> getOrderYearlyReport(
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear
    ) {
        int currentYear = Year.now().getValue();
        int resolvedStart = startYear != null ? startYear : currentYear - 4;
        int resolvedEnd = endYear != null ? endYear : currentYear;

        try {
            List<OrderYearlyPoint> data = orderReportService.getYearlyOrders(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/orders/users")
    public ResponseEntity<ApiResponse<List<OrderUserSummary>>> getOrderUsersReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = null;
        if (endDate != null) {
            endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        }
        int resolvedLimit = limit != null && limit > 0 ? limit : 10;

        List<OrderUserSummary> data = orderReportService.getOrdersByUser(startDateTime, endDateTime, resolvedLimit);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/revenue/summary")
    public ResponseEntity<ApiResponse<RevenueSummaryReport>> getRevenueSummary() {
        RevenueSummaryReport summary = revenueReportService.getRevenueSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<ApiResponse<List<RevenueDailyPoint>>> getRevenueDailyReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate resolvedEnd = endDate != null ? endDate : today;
            LocalDate resolvedStart = startDate != null ? startDate : resolvedEnd.minusDays(6);

            List<RevenueDailyPoint> data = revenueReportService.getDailyRevenue(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<ApiResponse<List<RevenueMonthlyPoint>>> getRevenueMonthlyReport(
            @RequestParam(value = "year", required = false) Integer year
    ) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<RevenueMonthlyPoint> data = revenueReportService.getMonthlyRevenue(targetYear);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/revenue/yearly")
    public ResponseEntity<ApiResponse<List<RevenueYearlyPoint>>> getRevenueYearlyReport(
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear
    ) {
        int currentYear = Year.now().getValue();
        int resolvedStart = startYear != null ? startYear : currentYear - 4;
        int resolvedEnd = endYear != null ? endYear : currentYear;

        try {
            List<RevenueYearlyPoint> data = revenueReportService.getYearlyRevenue(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/customers/monthly")
    public ResponseEntity<ApiResponse<List<CustomerRevenuePoint>>> getCustomerRevenueMonthly(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        LocalDate today = LocalDate.now();
        int resolvedYear = year != null ? year : today.getYear();
        int resolvedMonth = month != null ? month : today.getMonthValue();
        int resolvedLimit = limit != null ? limit : 10;

        try {
            List<CustomerRevenuePoint> data = revenueReportService.getCustomerRevenueByMonth(resolvedYear, resolvedMonth, resolvedLimit);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/customers/yearly")
    public ResponseEntity<ApiResponse<List<CustomerRevenuePoint>>> getCustomerRevenueYearly(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        int resolvedYear = year != null ? year : Year.now().getValue();
        int resolvedLimit = limit != null ? limit : 10;

        List<CustomerRevenuePoint> data = revenueReportService.getCustomerRevenueByYear(resolvedYear, resolvedLimit);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
