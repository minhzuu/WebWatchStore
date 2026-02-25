package iuh.fit.se.backend.dto.request;

import iuh.fit.se.backend.entity.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private ProductStatus status;
    private Long brandId;
    private Long categoryId;
    private Long supplierId;
    
    // Additional fields for product creation
    private BigDecimal price;           // Giá sản phẩm
    private Integer stockQuantity;      // Số lượng tồn kho
    
    // Multiple images support
    private List<ImageRequest> images;  // Danh sách ảnh
    private List<ProductSpecRequest> productSpecs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSpecRequest {
        private String keyName;
        private String value;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageRequest {
        private String imageUrl;        // Tên file ảnh
        private Boolean isPrimary;      // Ảnh chính
    }
}
