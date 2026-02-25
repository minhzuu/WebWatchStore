package iuh.fit.se.backend.dto.request;

import iuh.fit.se.backend.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "status is required")
    private OrderStatus status;
}
