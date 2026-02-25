package iuh.fit.se.backend.dto.response;

import iuh.fit.se.backend.entity.ProductImage;
import iuh.fit.se.backend.entity.ProductPrice;
import iuh.fit.se.backend.entity.Inventory;
import iuh.fit.se.backend.entity.ProductSpec;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String brand;
    private Long brandId;  // Thêm brandId
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String categoryName;
    private Long categoryId;  // Thêm categoryId
    private String supplierName;
    private Long supplierId;  // Thêm supplierId
    private String status;
    private Integer stockQuantity;
    private LocalDateTime createdAt;

    private Double rating;       // trung bình rating
    private Long numOfRating;    // tổng số review
    
    // Thêm để support edit
    private List<ProductImage> productImages;
    private List<ProductPrice> productPrices;
    private List<Inventory> inventories;
    private List<ProductSpec> productSpecs;

}
