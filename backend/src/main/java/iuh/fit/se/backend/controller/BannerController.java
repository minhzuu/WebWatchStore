package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.BannerRequest;
import iuh.fit.se.backend.entity.Banner;
import iuh.fit.se.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public List<Banner> getActiveBanners() {
        return bannerService.getActiveBanners();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public List<Banner> getAllBanners() {
        return bannerService.getAllBanners();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public Banner getBannerById(@PathVariable Long id) {
        return bannerService.getBannerById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Banner createBanner(@RequestBody BannerRequest request) {
        return bannerService.createBanner(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Banner updateBanner(@PathVariable Long id, @RequestBody BannerRequest request) {
        return bannerService.updateBanner(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
    }
}
