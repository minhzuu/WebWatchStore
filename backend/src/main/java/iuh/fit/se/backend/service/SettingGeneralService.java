package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.SettingGeneral;
import iuh.fit.se.backend.repository.SettingGeneralRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingGeneralService {
    
    private final SettingGeneralRepository settingRepository;

    /**
     * Get general settings (always return first record, create if not exists)
     */
    public SettingGeneral getSettings() {
        return settingRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    // Create default settings if not exists
                    SettingGeneral defaultSettings = SettingGeneral.builder()
                            .siteName("WATCH STORE")
                            .slogan("Đồng hồ chính hãng - Uy tín hàng đầu")
                            .email("contact@watchstore.com")
                            .hotline("1900 xxxx")
                            .address("123 Đường ABC, Quận XYZ, TP.HCM")
                            .copyright("© 2025 Watch Store. All rights reserved.")
                            .build();
                    return settingRepository.save(defaultSettings);
                });
    }

    /**
     * Update general settings
     */
    @Transactional
    public SettingGeneral updateSettings(SettingGeneral settings) {
        SettingGeneral existing = getSettings();
        
        // Update fields
        existing.setSiteName(settings.getSiteName());
        existing.setLogo(settings.getLogo());
        existing.setSlogan(settings.getSlogan());
        existing.setAddress(settings.getAddress());
        existing.setCopyright(settings.getCopyright());
        existing.setEmail(settings.getEmail());
        existing.setHotline(settings.getHotline());
        existing.setPaymentMethods(settings.getPaymentMethods());
        existing.setSocialMedia(settings.getSocialMedia());
        
        return settingRepository.save(existing);
    }
}
