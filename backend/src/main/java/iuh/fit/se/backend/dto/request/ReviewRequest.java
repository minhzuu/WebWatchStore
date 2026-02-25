package iuh.fit.se.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotBlank(message = "Comment is required")
    private String comment;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int rating;

    @NotNull(message = "User reference is required")
    private IdReference user;

    @NotNull(message = "Product reference is required")
    private IdReference product;

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public Long getProductId() {
        return product != null ? product.getId() : null;
    }

    @Data
    public static class IdReference {
        @NotNull(message = "Id is required")
        private Long id;
    }
}