package iuh.fit.se.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantity;

    // Giá snapshot tại thời điểm đặt hàng
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    // Snapshot thông tin sản phẩm tại thời điểm đặt hàng
    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_image_url", length = 500)
    private String productImageUrl;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference(value = "order-items")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference(value = "product-orderItems")
    private Product product;

    // Getter để serialize productId và productName mà không serialize toàn bộ product object
    public Long getProductId() {
        return product != null ? product.getId() : null;
    }
    
    public String getProductName() {
        if (productName != null) return productName;
        return product != null ? product.getName() : null;
    }

    @PrePersist
    public void prePersist() {
        if (this.product != null) {
            // Snapshot giá
            if (this.price == null) {
                this.price = product.getCurrentPrice();
            }
            // Snapshot tên và ảnh
            if (this.productName == null) {
                this.productName = product.getName();
            }
            if (this.productImageUrl == null) {
                this.productImageUrl = product.getPrimaryImageUrl();
            }
        }
    }
}
