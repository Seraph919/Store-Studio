package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.AdminAnalyticsDto;
import org.storestudio.store.dtos.AdminHealthDto;
import org.storestudio.store.dtos.FeedbackDto;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.UpdateRoleDto;
import org.storestudio.store.dtos.UpdateUserStatusDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.user.UserCreationDto;
import org.storestudio.store.services.AdminService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // --- 1. Platform Analytics & Health ---
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsDto> getPlatformAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformAnalytics());
    }

    @GetMapping("/health")
    public ResponseEntity<AdminHealthDto> getSystemHealth() {
        return ResponseEntity.ok(adminService.getSystemHealth());
    }

    // --- 2. Seller & Account Governance ---
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserCreationDto dto) {
        UserDto created = adminService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateUserStatusDto dto) {
        UserDto updated = adminService.updateUserStatus(id, dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateRoleDto dto) {
        UserDto updated = adminService.updateUserRole(id, dto.getRole());
        return ResponseEntity.ok(updated);
    }

    // --- 3. Catalog & Feedback Moderation ---
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @PatchMapping("/products/{id}/listing")
    public ResponseEntity<ProductDto> toggleProductListing(
            @PathVariable("id") Long id,
            @RequestParam(value = "isListed", required = false) Boolean isListed) {
        ProductDto updated = adminService.toggleProductListing(id, isListed);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<FeedbackDto>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllReviews());
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    // --- 4. Admin CSV Exports ---
    @GetMapping(value = "/export/financial-audit", produces = "text/csv")
    public ResponseEntity<byte[]> exportFinancialAuditCsv() {
        String csvContent = adminService.exportFinancialAuditCsv();
        byte[] csvBytes = csvContent.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"financial_sales_audit.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping(value = "/export/seller-directory", produces = "text/csv")
    public ResponseEntity<byte[]> exportSellerDirectoryCsv() {
        String csvContent = adminService.exportSellerDirectoryCsv();
        byte[] csvBytes = csvContent.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"seller_directory_registry.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}

