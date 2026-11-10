package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.AddItemToCartDto;
import org.storestudio.store.dtos.CartCreatedResponse;
import org.storestudio.store.dtos.CartDto;
import org.storestudio.store.dtos.UpdateCartItemDto;
import org.storestudio.store.services.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/carts")
public class CartController {
    private final CartService cartService;

    @PostMapping("")
    public ResponseEntity<CartCreatedResponse> createCart() {
        CartCreatedResponse response = cartService.createCart();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<CartDto> getCart(@PathVariable("cartId") UUID cartId) {
        CartDto cart = cartService.getCartDto(cartId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{cartId}/items")
    public ResponseEntity<CartDto> addItem(
            @PathVariable("cartId") UUID cartId,
            @Valid @RequestBody AddItemToCartDto dto) {
        CartDto cart = cartService.addItemToCart(cartId, dto);
        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/{cartId}/items/{productId}")
    public ResponseEntity<CartDto> updateItemQuantity(
            @PathVariable("cartId") UUID cartId,
            @PathVariable("productId") Long productId,
            @Valid @RequestBody UpdateCartItemDto dto) {
        CartDto cart = cartService.updateItemQuantity(cartId, productId, dto.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{cartId}/items/{productId}")
    public ResponseEntity<CartDto> removeItem(
            @PathVariable("cartId") UUID cartId,
            @PathVariable("productId") Long productId) {
        CartDto cart = cartService.removeItemFromCart(cartId, productId);
        return ResponseEntity.ok(cart);
    }
}
