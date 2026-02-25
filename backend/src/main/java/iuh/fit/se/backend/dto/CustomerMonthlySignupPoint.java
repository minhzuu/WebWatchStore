package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMonthlySignupPoint {
    private int month;
    private long newCustomers;
}
