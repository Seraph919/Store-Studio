package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.SellerStorefrontDto;
import org.storestudio.store.dtos.UpdateSellerStorefrontDto;
import org.storestudio.store.services.SellerStorefrontService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/seller/storefront", "/api/seller/storefront"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
public class SellerStorefrontController {

    private final SellerStorefrontService storefrontService;

    @GetMapping
    public ResponseEntity<SellerStorefrontDto> getStorefront(Authentication authentication) {
        SellerStorefrontDto dto = storefrontService.getOrCreateSellerStorefront(authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<SellerStorefrontDto> updateStorefront(
            Authentication authentication,
            @Valid @RequestBody UpdateSellerStorefrontDto dto) {
        SellerStorefrontDto updated = storefrontService.updateSellerStorefront(authentication.getName(), dto);
        return ResponseEntity.ok(updated);
    }
}
