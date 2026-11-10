package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.StoreDesignDto;
import org.storestudio.store.dtos.UpdateStoreDesignDto;
import org.storestudio.store.services.StoreDesignService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/store/design", "/api/store/design", "/api/v1/owner/store/design"})
@RequiredArgsConstructor
public class StoreDesignController {

    private final StoreDesignService storeDesignService;

    @GetMapping
    public ResponseEntity<StoreDesignDto> getPublishedDesign() {
        return ResponseEntity.ok(storeDesignService.getPublishedDesign());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<StoreDesignDto> updateDesign(@Valid @RequestBody UpdateStoreDesignDto dto) {
        StoreDesignDto updated = storeDesignService.updateDesign(dto);
        return ResponseEntity.ok(updated);
    }
}
