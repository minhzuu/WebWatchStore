package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.CustomerRevenuePoint;
import iuh.fit.se.backend.dto.RevenueDailyPoint;
import iuh.fit.se.backend.dto.RevenueMonthlyPoint;
import iuh.fit.se.backend.dto.RevenueSummaryReport;
import iuh.fit.se.backend.dto.RevenueYearlyPoint;

import java.time.LocalDate;
import java.util.List;

public interface RevenueReportService {

    RevenueSummaryReport getRevenueSummary();

    List<RevenueDailyPoint> getDailyRevenue(LocalDate startDate, LocalDate endDate);

    List<RevenueMonthlyPoint> getMonthlyRevenue(int year);

    List<RevenueYearlyPoint> getYearlyRevenue(int startYear, int endYear);

    List<CustomerRevenuePoint> getCustomerRevenueByMonth(int year, int month, int limit);

    List<CustomerRevenuePoint> getCustomerRevenueByYear(int year, int limit);
}
