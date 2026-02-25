package iuh.fit.se.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String comment;
    private int rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long userId;
    private String username;
    private String userFullName;
    private String userEmail;

    private Long productId;
    private String productName;
}
