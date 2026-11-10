package org.storestudio.store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.OrderDto;
import org.storestudio.store.dtos.OrderItemDto;
import org.storestudio.store.dtos.UpdateOrderStatusDto;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.services.OrderService;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SellerOrderControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OrderService orderService;

    @InjectMocks
    private SellerOrderController sellerOrderController;

    private Authentication sellerAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(sellerOrderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sellerAuth = new UsernamePasswordAuthenticationToken(
                "seller@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_SELLER"))
        );
    }

    @Test
    void getSellerOrders_Success() throws Exception {
        org.storestudio.store.dtos.SellerOrderDto sellerOrderDto = org.storestudio.store.dtos.SellerOrderDto.builder()
                .id(10L)
                .orderId(100L)
                .customerName("John Doe")
                .phoneNumber("5551234")
                .shippingAddress("123 Street")
                .city("City")
                .subtotal(new BigDecimal("200.00"))
                .status("PENDING")
                .createdAt(Instant.now())
                .items(List.of(
                        OrderItemDto.builder()
                                .id(1L)
                                .productId(5L)
                                .productName("Laptop Stand")
                                .sellerId(2L)
                                .quantity(2L)
                                .price(new BigDecimal("100.00"))
                                .subtotal(new BigDecimal("200.00"))
                                .build()
                ))
                .build();

        when(orderService.getSellerOrders("seller@example.com")).thenReturn(List.of(sellerOrderDto));

        mockMvc.perform(get("/api/seller/orders")
                        .principal(sellerAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[0].items[0].sellerId").value(2L))
                .andExpect(jsonPath("$[0].subtotal").value(200.00));
    }

    @Test
    void updateOrderStatus_Success() throws Exception {
        UpdateOrderStatusDto updateDto = UpdateOrderStatusDto.builder()
                .status("CONFIRMED")
                .build();

        OrderDto updated = OrderDto.builder()
                .id(10L)
                .status("CONFIRMED")
                .totalPrice(new BigDecimal("200.00"))
                .build();

        when(orderService.updateOrderStatus(10L, "CONFIRMED", "seller@example.com")).thenReturn(updated);

        mockMvc.perform(patch("/api/seller/orders/10/status")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void updateOrderStatus_UnauthorizedSeller_ReturnsForbidden() throws Exception {
        UpdateOrderStatusDto updateDto = UpdateOrderStatusDto.builder()
                .status("SHIPPED")
                .build();

        when(orderService.updateOrderStatus(eq(10L), eq("SHIPPED"), eq("seller@example.com")))
                .thenThrow(new UnauthorizedAccessException("Seller is not authorized to update order #10"));

        mockMvc.perform(patch("/api/seller/orders/10/status")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Seller is not authorized to update order #10"));
    }

    @Test
    void updateOrderStatus_InvalidStatus_ReturnsBadRequest() throws Exception {
        UpdateOrderStatusDto updateDto = UpdateOrderStatusDto.builder()
                .status("INVALID_STATUS")
                .build();

        mockMvc.perform(patch("/api/seller/orders/10/status")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());
    }
}
