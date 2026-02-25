package iuh.fit.se.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import iuh.fit.se.backend.entity.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    @JsonBackReference(value = "brand-products")
    private Brand brand;


    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference(value = "category-products")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    @JsonBackReference(value = "supplier-products")
    private Supplier supplier;

    // One-to-Many relationships
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "product-images")
    @Builder.Default
    private List<ProductImage> productImages = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "product-specs")
    @Builder.Default
    private List<ProductSpec> productSpecs = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "product-prices")
    @Builder.Default
    private List<ProductPrice> productPrices = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "product-inventory")
    @Builder.Default
    private List<Inventory> inventories = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "product-reviews")
    @Builder.Default
    @ToString.Exclude
    private List<Review> reviews = new ArrayList<>();

    // Many-to-Many with Promotion
    @ManyToMany(mappedBy = "products")
    @Builder.Default
    @ToString.Exclude
    private List<Promotion> promotions = new ArrayList<>();

    // One-to-Many with CartItem and OrderItem
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "product-cartItems")
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "product-orderItems")
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @Builder.Default
    @ToString.Exclude
    private List<Banner> banners = new ArrayList<>();

    // Helper method to get current price
    public BigDecimal getCurrentPrice() {
        return productPrices.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsCurrent()))
                .findFirst()
                .map(ProductPrice::getPrice)
                .orElse(BigDecimal.ZERO);
    }

    // Helper method to get primary image
    public String getPrimaryImageUrl() {
        return productImages.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }

    public Integer getStockQuantity() {
        return inventories.stream()
                .mapToInt(Inventory::getStock)
                .sum();
    }
}
