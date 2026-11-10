package org.storestudio.store.controllers;

import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.SellerKpiDto;
import org.storestudio.store.dtos.SellerOrderDto;
import org.storestudio.store.dtos.StoreSettingsDto;
import org.storestudio.store.services.OrderService;
import org.storestudio.store.services.ProductService;
import org.storestudio.store.services.StoreSettingsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Read-only, scope-restricted REST interface for the external MCP server. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mcp")
public class McpStoreController {
    private final ProductService productService;
    private final OrderService orderService;
    private final StoreSettingsService storeSettingsService;

    @GetMapping("/products")
    @PreAuthorize("hasAuthority('MCP_PRODUCTS_READ')")
    public List<ProductDto> products(Authentication authentication) {
        return productService.getSellerProducts(authentication.getName());
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('MCP_ORDERS_READ')")
    public List<SellerOrderDto> orders(Authentication authentication) {
        return orderService.getSellerOrders(authentication.getName());
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('MCP_ANALYTICS_READ')")
    public SellerKpiDto analytics(Authentication authentication) {
        return orderService.getSellerKpis(authentication.getName());
    }

    @GetMapping("/settings")
    @PreAuthorize("hasAuthority('MCP_SETTINGS_READ')")
    public StoreSettingsDto settings() {
        return storeSettingsService.getSettings();
    }
}
