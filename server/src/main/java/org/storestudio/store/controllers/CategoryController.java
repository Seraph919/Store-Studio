package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.CategoryDto;
import org.storestudio.store.dtos.UpdateCategoryDto;
import org.storestudio.store.services.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/admin/categories", "/api/admin/categories"})
public class CategoryController {

    private final AdminService adminService;

    @GetMapping("")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(adminService.getCategories());
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody UpdateCategoryDto dto) {
        CategoryDto created = adminService.createCategory(dto.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable("id") Short id,
            @Valid @RequestBody UpdateCategoryDto dto) {
        CategoryDto updated = adminService.updateCategory(id, dto.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Short id) {
        adminService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}

