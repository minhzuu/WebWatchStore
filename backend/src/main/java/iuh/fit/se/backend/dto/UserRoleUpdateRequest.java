package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.enums.Role;
import lombok.Data;

@Data
public class UserRoleUpdateRequest {
    private Role role;
}
