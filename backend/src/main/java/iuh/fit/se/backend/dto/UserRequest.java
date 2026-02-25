package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import lombok.Data;
import org.springframework.util.StringUtils;

@Data
public class UserRequest {
    private String username;
    private String email;
    private String fullName;
    private String password;
    private Role role;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private String avatarUrl;
    private java.time.LocalDate dateOfBirth;

    public User toEntity() {
        return User.builder()
                .username(username != null ? username.trim() : null)
                .email(email != null ? email.trim() : null)
                .fullName(fullName != null ? fullName.trim() : null)
                .password(password)
                .role(role)
                .phone(phone != null ? phone.trim() : null)
                .address(address != null ? address.trim() : null)
                .city(city != null ? city.trim() : null)
                .country(country != null ? country.trim() : null)
                .postalCode(postalCode != null ? postalCode.trim() : null)
                .avatarUrl(avatarUrl != null ? avatarUrl.trim() : null)
                .dateOfBirth(dateOfBirth)
                .build();
    }

    public boolean hasPassword() {
        return StringUtils.hasText(password);
    }
}
