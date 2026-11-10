package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.OrderDto;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.SellerKpiDto;
import org.storestudio.store.dtos.SellerMediaConfigDto;
import org.storestudio.store.dtos.SellerOrderDto;
import org.storestudio.store.dtos.UpdateOrderStatusDto;
import org.storestudio.store.services.OrderService;
import org.storestudio.store.services.ProductService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping({"/api/v1/seller", "/api/seller", "/api/v1/owner", "/api/owner"})
@PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
public class SellerOrderController {

    private final OrderService orderService;
    private final ProductService productService;

    // --- KPI Analytics ---
    @GetMapping("/analytics/kpis")
    public ResponseEntity<SellerKpiDto> getSellerKpis(Authentication authentication) {
        SellerKpiDto kpis = orderService.getSellerKpis(authentication.getName());
        return ResponseEntity.ok(kpis);
    }

    // --- Orders & Phone Verification ---
    @GetMapping("/orders")
    public ResponseEntity<List<SellerOrderDto>> getSellerOrders(Authentication authentication) {
        List<SellerOrderDto> orders = orderService.getSellerOrders(authentication.getName());
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable("orderId") Long orderId,
            @Valid @RequestBody UpdateOrderStatusDto dto,
            Authentication authentication) {
        OrderDto updated = orderService.updateOrderStatus(orderId, dto.getStatus(), authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/seller-orders/{sellerOrderId}/status")
    public ResponseEntity<SellerOrderDto> updateSellerOrderStatus(
            @PathVariable("sellerOrderId") Long sellerOrderId,
            @Valid @RequestBody UpdateOrderStatusDto dto,
            Authentication authentication) {
        SellerOrderDto updated = orderService.updateSellerOrderStatus(sellerOrderId, dto.getStatus(), authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /** Manual confirmation after the seller verifies funds in an external payment channel. */
    @PatchMapping("/seller-orders/{sellerOrderId}/confirm-upfront")
    public ResponseEntity<SellerOrderDto> confirmUpfrontPayment(
            @PathVariable Long sellerOrderId, Authentication authentication) {
        return ResponseEntity.ok(orderService.confirmUpfrontPayment(sellerOrderId, authentication.getName()));
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable("orderId") Long orderId,
            Authentication authentication) {
        orderService.deleteOrder(orderId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/orders/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportOrdersCsv(Authentication authentication) {
        String csvContent = orderService.exportSellerOrdersCsv(authentication.getName());
        byte[] csvBytes = csvContent.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"courier_dispatch_orders.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    // --- Catalog & Media Configuration ---
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getSellerProducts(Authentication authentication) {
        List<ProductDto> products = productService.getSellerProducts(authentication.getName());
        return ResponseEntity.ok(products);
    }

    @PatchMapping("/products/{productId}/media-config")
    public ResponseEntity<ProductDto> updateMediaConfig(
            @PathVariable("productId") Long productId,
            @RequestBody SellerMediaConfigDto dto,
            Authentication authentication) {
        ProductDto updated = productService.updateProductMediaConfig(productId, dto, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/products/{productId}/listing")
    public ResponseEntity<ProductDto> toggleProductListing(
            @PathVariable("productId") Long productId,
            @RequestParam(value = "isListed", required = false) Boolean isListed,
            Authentication authentication) {
        ProductDto updated = productService.toggleProductListing(productId, isListed, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody org.storestudio.store.dtos.CreateProductDto dto,
            Authentication authentication) {
        ProductDto updated = productService.updateProduct(productId, dto, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable("productId") Long productId,
            Authentication authentication) {
        productService.deleteProduct(productId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
