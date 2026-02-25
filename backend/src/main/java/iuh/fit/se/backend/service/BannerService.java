package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.BannerRequest;
import iuh.fit.se.backend.entity.*;
import iuh.fit.se.backend.entity.enums.BannerLinkType;
import iuh.fit.se.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository bannerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PromotionRepository promotionRepository;
    private final BrandRepository brandRepository;

    /**
     * Set entity relationships based on linkType and linkId
     * Validates that the referenced entity exists
     * Note: linkId is the main reference field, entity relationships are for JPA mapping only
     */
    private void setEntityRelationship(Banner banner, BannerLinkType linkType, Long linkId) {
        // Clear all relationships first
        banner.setProduct(null);
        banner.setCategory(null);
        banner.setPromotion(null);
        banner.setBrand(null);

        // Set the appropriate relationship based on linkType
        // linkId is kept as-is for backward compatibility and display purposes
        if (linkId != null && linkType != null) {
            switch (linkType) {
                case PRODUCT:
                    Product product = productRepository.findById(linkId)
                            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + linkId));
                    banner.setProduct(product);
                    break;
                case CATEGORY:
                    Category category = categoryRepository.findById(linkId)
                            .orElseThrow(() -> new RuntimeException("Category not found with ID: " + linkId));
                    banner.setCategory(category);
                    break;
                case PROMOTION:
                    Promotion promotion = promotionRepository.findById(linkId)
                            .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + linkId));
                    banner.setPromotion(promotion);
                    break;
                case BRAND:
                    Brand brand = brandRepository.findById(linkId)
                            .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + linkId));
                    banner.setBrand(brand);
                    break;
                case CUSTOM:
                    // No entity relationship needed for custom links
                    break;
            }
        }
    }

    @Transactional
    public Banner createBanner(BannerRequest request) {
        Banner banner = new Banner();
        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setDescription(request.getDescription());
        banner.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        banner.setActive(request.getActive() != null ? request.getActive() : true);
        
        // Set new fields
        banner.setLinkType(request.getLinkType());
        banner.setLinkId(request.getLinkId());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());
        banner.setPosition(request.getPosition());

        // Set entity relationships with validation
        setEntityRelationship(banner, request.getLinkType(), request.getLinkId());

        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setDescription(request.getDescription());
        banner.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        banner.setActive(request.getActive() != null ? request.getActive() : true);
        
        // Update new fields
        if (request.getLinkType() != null) {
            banner.setLinkType(request.getLinkType());
        }
        if (request.getLinkId() != null) {
            banner.setLinkId(request.getLinkId());
        }
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());
        if (request.getPosition() != null) {
            banner.setPosition(request.getPosition());
        }

        // Update entity relationships with validation
        setEntityRelationship(banner, banner.getLinkType(), banner.getLinkId());

        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByActiveOrderByDisplayOrderAsc(true);
    }
}
