package iuh.fit.se.backend.dto.response;

import iuh.fit.se.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String role;
    private User user;


}
