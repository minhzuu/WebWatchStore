package iuh.fit.se.backend.dto.request;

import iuh.fit.se.backend.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull(message = "UserId is required")
    private Long userId;
    
    @NotNull(message = "Order items are required")
    private List<OrderItemRequest> orderItems;
    
    // Shipping information
    private String fullName;
    private String phone;
    private String address;
    private String ward;
    private String district;
    private String city;
    private String note;
    
    // Payment information
    private PaymentMethod paymentMethod;
}
