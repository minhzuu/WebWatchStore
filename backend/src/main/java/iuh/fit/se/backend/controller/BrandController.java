package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Brand;
import iuh.fit.se.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/{id}")
    public Brand getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Brand createBrand(@RequestBody Brand brand) {
        return brandService.saveBrand(brand);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Brand updateBrand(@PathVariable Long id, @RequestBody Brand brand) {
        Brand existingBrand = brandService.getBrandById(id);
        if (existingBrand == null) {
            throw new RuntimeException("Brand not found with id: " + id);
        }
        
        // Update only non-null fields
        if (brand.getName() != null) existingBrand.setName(brand.getName());
        if (brand.getDescription() != null) existingBrand.setDescription(brand.getDescription());
        if (brand.getLogoUrl() != null) existingBrand.setLogoUrl(brand.getLogoUrl());
        if (brand.getStatus() != null) existingBrand.setStatus(brand.getStatus());
        
        return brandService.saveBrand(existingBrand);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
    }
}
