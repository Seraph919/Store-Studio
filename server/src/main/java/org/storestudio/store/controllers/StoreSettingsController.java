package org.storestudio.store.controllers;

import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.StoreSettingsDto;
import org.storestudio.store.services.StoreSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping({"/api/v1/settings", "/api/settings", "/api/v1/store", "/api/store", "/api/v1/owner/store/settings"})
public class StoreSettingsController {

    private final StoreSettingsService storeSettingsService;

    @GetMapping({"", "/settings"})
    public ResponseEntity<StoreSettingsDto> getSettings() {
        return ResponseEntity.ok(storeSettingsService.getSettings());
    }

    @PutMapping({"", "/settings"})
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<StoreSettingsDto> updateSettings(@RequestBody StoreSettingsDto dto) {
        return ResponseEntity.ok(storeSettingsService.updateSettings(dto));
    }
}
