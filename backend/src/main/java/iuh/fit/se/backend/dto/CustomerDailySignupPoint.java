package iuh.fit.se.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDailySignupPoint {
    private LocalDate date;
    private long newCustomers;
}
