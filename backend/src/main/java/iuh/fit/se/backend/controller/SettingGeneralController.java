package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.SettingGeneral;
import iuh.fit.se.backend.service.SettingGeneralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingGeneralController {

    private final SettingGeneralService settingService;

    /**
     * Get general settings (public access)
     */
    @GetMapping("/general")
    public ResponseEntity<SettingGeneral> getSettings() {
        return ResponseEntity.ok(settingService.getSettings());
    }

    /**
     * Update general settings (ADMIN only)
     */
    @PutMapping("/general")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingGeneral> updateSettings(@RequestBody SettingGeneral settings) {
        return ResponseEntity.ok(settingService.updateSettings(settings));
    }
}
