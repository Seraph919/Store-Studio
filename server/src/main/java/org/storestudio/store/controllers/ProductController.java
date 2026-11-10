package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.CategoryDto;
import org.storestudio.store.dtos.CreateProductDto;
import org.storestudio.store.dtos.PagedResponse;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.services.ProductService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping({"/api/v1/products", "/api/products"})
public class ProductController {
    private final ProductService productService;

    @GetMapping("")
    public ResponseEntity<PagedResponse<ProductDto>> getProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sort", defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(productService.getPagedProducts(category, search, pageable));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @GetMapping("/top-ordered")
    public ResponseEntity<ProductDto> getTopOrderedProduct(@RequestParam(value = "isPack", defaultValue = "false") boolean isPack) {
        ProductDto product = productService.getTopOrderedProduct(isPack);
        if (product == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable("id") Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductDto>> getRelatedProducts(
            @PathVariable("id") Long id,
            @RequestParam(value = "limit", defaultValue = "4") int limit) {
        return ResponseEntity.ok(productService.getRelatedProducts(id, limit));
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<ProductDto> createProduct(
            @Valid @RequestBody CreateProductDto productDto,
            Authentication authentication) {
        String authEmail = (authentication != null) ? authentication.getName() : null;
        ProductDto created = productService.createProduct(productDto, null, authEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateProductDto productDto,
            Authentication authentication) {
        String authEmail = (authentication != null) ? authentication.getName() : null;
        ProductDto updated = productService.updateProduct(id, productDto, authEmail);
        return ResponseEntity.ok(updated);
    }
}
