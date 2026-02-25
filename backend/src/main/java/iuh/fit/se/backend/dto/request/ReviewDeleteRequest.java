package iuh.fit.se.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewDeleteRequest {
    @NotBlank(message = "Deletion reason is required")
    private String reason;
}
