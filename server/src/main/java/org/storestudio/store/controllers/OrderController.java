package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.CreateOrderDto;
import org.storestudio.store.dtos.OrderDto;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.services.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping({"/api/v1/orders", "/api/orders"})
public class OrderController {
    private final OrderService orderService;

    @PostMapping("")
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderDto createOrderDto) {
        OrderDto order = orderService.createOrder(createOrderDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }


    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable("id") Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("Authentication required to access order by ID. Only store staff may access order details.");
        }
        OrderDto order = orderService.getOrderById(id, authentication.getName());
        return ResponseEntity.ok(order);
    }
}
