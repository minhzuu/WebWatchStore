package iuh.fit.se.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationReadRequest {
    @NotNull(message = "User id is required")
    private Long userId;
}
