package org.storestudio.store.controllers;

import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.PagedResponse;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.PublicStorefrontDto;
import org.storestudio.store.services.SellerStorefrontService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/stores", "/api/stores"})
@RequiredArgsConstructor
public class PublicStorefrontController {

    private final SellerStorefrontService storefrontService;

    @GetMapping("/{slug}")
    public ResponseEntity<PublicStorefrontDto> getStorefront(@PathVariable("slug") String slug) {
        PublicStorefrontDto dto = storefrontService.getPublicStorefront(slug);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{slug}/products")
    public ResponseEntity<PagedResponse<ProductDto>> getStorefrontProducts(
            @PathVariable("slug") String slug,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            @PageableDefault(size = 12) Pageable pageable) {

        PagedResponse<ProductDto> response = storefrontService.getStorefrontProducts(slug, category, search, pageable);
        return ResponseEntity.ok(response);
    }
}
