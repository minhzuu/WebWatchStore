package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.InventoryDailyPoint;
import iuh.fit.se.backend.dto.InventoryMonthlyPoint;
import iuh.fit.se.backend.dto.InventorySummaryReport;
import iuh.fit.se.backend.dto.InventoryYearlyPoint;

import java.time.LocalDate;
import java.util.List;

public interface InventoryReportService {

    InventorySummaryReport getInventorySummary();

    List<InventoryDailyPoint> getDailyInventory(LocalDate startDate, LocalDate endDate);

    List<InventoryMonthlyPoint> getMonthlyInventory(int year);

    List<InventoryYearlyPoint> getYearlyInventory(int startYear, int endYear);
}
