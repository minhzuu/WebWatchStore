package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Brand;
import iuh.fit.se.backend.entity.enums.Status;
import iuh.fit.se.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;


    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {return brandRepository.findById(id).orElse(null);}

    public Brand getBrand(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    public Brand saveBrand(Brand brand) {
        // Set default status if null (for new brands)
        if (brand.getStatus() == null) {
            brand.setStatus(Status.ACTIVE);
        }
        return brandRepository.save(brand);
    }

    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElse(null);
        brand.setStatus(Status.INACTIVE);
        brandRepository.save(brand);
    }
}
