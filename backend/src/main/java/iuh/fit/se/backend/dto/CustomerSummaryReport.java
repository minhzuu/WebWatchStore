package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryReport {
    private long totalCustomers;
    private long activeCustomers;
    private long inactiveCustomers;
    private long newCustomersToday;
    private long newCustomersThisMonth;
}
