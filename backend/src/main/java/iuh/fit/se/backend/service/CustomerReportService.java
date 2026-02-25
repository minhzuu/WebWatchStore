package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.CustomerDailySignupPoint;
import iuh.fit.se.backend.dto.CustomerMonthlySignupPoint;
import iuh.fit.se.backend.dto.CustomerSummaryReport;
import iuh.fit.se.backend.dto.CustomerYearlySignupPoint;

import java.time.LocalDate;
import java.util.List;

public interface CustomerReportService {
    CustomerSummaryReport getCustomerSummary();

    List<CustomerDailySignupPoint> getDailySignups(LocalDate startDate, LocalDate endDate);

    List<CustomerMonthlySignupPoint> getMonthlySignups(int year);

    List<CustomerYearlySignupPoint> getYearlySignups(int startYear, int endYear);
}
