package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.ProductRequest;
import iuh.fit.se.backend.dto.response.ProductResponse;
import iuh.fit.se.backend.entity.*;
import iuh.fit.se.backend.entity.enums.ProductStatus;
import iuh.fit.se.backend.repository.BrandRepository;
import iuh.fit.se.backend.repository.CategoryRepository;
import iuh.fit.se.backend.repository.SupplierRepository;
import iuh.fit.se.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

//    @GetMapping
//    public List<Product> getAll() {
//        return productService.getAllProducts();
//    }

    @GetMapping
    public Page<ProductResponse> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String order
    ) {
        return productService.searchProducts(name, category, brand, supplier, minPrice, maxPrice, status, page, size, sortBy, order);
    }

    @GetMapping("/price-range")
    public iuh.fit.se.backend.dto.response.PriceRangeResponse getPriceRange() {
        return productService.getPriceRange();
    }

    @GetMapping("/{id}")
    public ProductResponse getOne(@PathVariable Long id) {
        Product product = productService.getProduct(id);
        
        // Convert to ProductResponse with full info
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setStatus(product.getStatus().toString());
        
        // Brand info
        response.setBrand(product.getBrand().getName());
        response.setBrandId(product.getBrand().getId());
        
        // Category info
        response.setCategoryName(product.getCategory().getName());
        response.setCategoryId(product.getCategory().getId());
        
        // Supplier info
        response.setSupplierName(product.getSupplier().getName());
        response.setSupplierId(product.getSupplier().getId());
        
        // Price, stock, images
        response.setProductPrices(product.getProductPrices());
        response.setInventories(product.getInventories());
        response.setProductImages(product.getProductImages());
        response.setProductSpecs(product.getProductSpecs());

        // Current price and stock
        if (!product.getProductPrices().isEmpty()) {
            ProductPrice currentPrice = product.getProductPrices().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsCurrent()))
                .findFirst()
                .orElse(product.getProductPrices().get(0));
            response.setPrice(currentPrice.getPrice());
        }
        
        if (!product.getInventories().isEmpty()) {
            response.setStockQuantity(product.getInventories().get(0).getStock());
        }
        
        // Primary image
        if (!product.getProductImages().isEmpty()) {
            String primaryImage = product.getProductImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(product.getProductImages().get(0).getImageUrl());
            response.setImageUrl(primaryImage);
        }

        // CreatedAt
        response.setCreatedAt(product.getCreatedAt());
        
        return response;
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String name) {
        return productService.searchProducts(name);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Product create(@RequestBody ProductRequest request) {
        // Convert DTO to Entity
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setStatus(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE);
        
        // Set relationships
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        product.setBrand(brand);
        product.setCategory(category);
        product.setSupplier(supplier);
        
        // Initialize collections
        product.setProductPrices(new ArrayList<>());
        product.setInventories(new ArrayList<>());
        product.setProductImages(new ArrayList<>());
        
        // Add price if provided
        if (request.getPrice() != null) {
            ProductPrice price = ProductPrice.builder()
                    .product(product)
                    .priceType("REGULAR")
                    .price(request.getPrice())
                    .startDate(LocalDateTime.now())
                    .isCurrent(true)
                    .build();
            product.getProductPrices().add(price);
        }
        
        // Add inventory if provided
        if (request.getStockQuantity() != null) {
            Inventory inventory = Inventory.builder()
                    .product(product)
                    .stock(request.getStockQuantity())
                    .build();
            product.getInventories().add(inventory);
        }
        
        // Add images if provided
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (ProductRequest.ImageRequest imgReq : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(imgReq.getImageUrl())
                        .isPrimary(imgReq.getIsPrimary() != null ? imgReq.getIsPrimary() : false)
                        .build();
                product.getProductImages().add(image);
            }
        }

        // Add product specs if provided
        if (request.getProductSpecs() != null && !request.getProductSpecs().isEmpty()) {
            for (ProductRequest.ProductSpecRequest specReq : request.getProductSpecs()) {
                ProductSpec spec = new ProductSpec();
                spec.setProduct(product);
                spec.setKeyName(specReq.getKeyName());
                spec.setValue(specReq.getValue());
                product.getProductSpecs().add(spec);
            }
        }
        
        return productService.saveProduct(product);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody ProductRequest request) {
        Product product = productService.getProduct(id);
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setStatus(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE);
        
        // Update relationships if changed
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(supplier);
        }
        
        // Update price if provided
        if (request.getPrice() != null) {
            // Set all existing prices to not current
            product.getProductPrices().forEach(p -> p.setIsCurrent(false));
            
            // Add new price
            ProductPrice newPrice = ProductPrice.builder()
                    .product(product)
                    .priceType("REGULAR")
                    .price(request.getPrice())
                    .startDate(LocalDateTime.now())
                    .isCurrent(true)
                    .build();
            product.getProductPrices().add(newPrice);
        }
        
        // Update inventory if provided
        if (request.getStockQuantity() != null) {
            if (product.getInventories().isEmpty()) {
                // Create new inventory if none exists
                Inventory inventory = Inventory.builder()
                        .product(product)
                        .stock(request.getStockQuantity())
                        .build();
                product.getInventories().add(inventory);
            } else {
                // Update existing inventory
                product.getInventories().get(0).setStock(request.getStockQuantity());
            }
        }
        
        // Update images if provided
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // Clear existing images
            product.getProductImages().clear();
            
            // Add new images
            for (ProductRequest.ImageRequest imgReq : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(imgReq.getImageUrl())
                        .isPrimary(imgReq.getIsPrimary() != null ? imgReq.getIsPrimary() : false)
                        .build();
                product.getProductImages().add(image);
            }
        }

        // Update product specs if provided
        if (request.getProductSpecs() != null) {
            // clear existing specs (orphanRemoval will delete)
            product.getProductSpecs().clear();
            for (ProductRequest.ProductSpecRequest specReq : request.getProductSpecs()) {
                ProductSpec spec = new ProductSpec();
                spec.setProduct(product);
                spec.setKeyName(specReq.getKeyName());
                spec.setValue(specReq.getValue());
                product.getProductSpecs().add(spec);
            }
        }
        
        return productService.saveProduct(product);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }


    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategory(@PathVariable Long categoryId) {
        return productService.getProductsByCategory(categoryId);
    }

}
