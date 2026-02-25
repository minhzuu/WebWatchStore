package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummary {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private String avatarUrl;
    private java.time.LocalDate dateOfBirth;
}
