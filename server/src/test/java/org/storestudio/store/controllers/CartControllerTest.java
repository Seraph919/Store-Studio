package org.storestudio.store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.AddItemToCartDto;
import org.storestudio.store.dtos.CartCreatedResponse;
import org.storestudio.store.dtos.CartDto;
import org.storestudio.store.dtos.CartItemDto;
import org.storestudio.store.dtos.UpdateCartItemDto;
import org.storestudio.store.exceptions.CartNotFoundException;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.services.CartService;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    private final UUID cartId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(cartController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createCart_Success() throws Exception {
        when(cartService.createCart()).thenReturn(new CartCreatedResponse(cartId));

        mockMvc.perform(post("/api/carts"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cartId").value(cartId.toString()));
    }

    @Test
    void getCart_Success() throws Exception {
        CartDto cartDto = CartDto.builder()
                .id(cartId)
                .cartId(cartId)
                .totalPrice(new BigDecimal("100.00"))
                .items(List.of(
                        CartItemDto.builder()
                                .id(1L)
                                .productId(10L)
                                .productName("Keyboard")
                                .unitPrice(new BigDecimal("50.00"))
                                .price(new BigDecimal("50.00"))
                                .quantity(2L)
                                .subtotal(new BigDecimal("100.00"))
                                .itemTotalPrice(new BigDecimal("100.00"))
                                .build()
                ))
                .build();

        when(cartService.getCartDto(cartId)).thenReturn(cartDto);

        mockMvc.perform(get("/api/carts/" + cartId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value(cartId.toString()))
                .andExpect(jsonPath("$.totalPrice").value(100.00))
                .andExpect(jsonPath("$.items[0].productId").value(10L))
                .andExpect(jsonPath("$.items[0].productName").value("Keyboard"))
                .andExpect(jsonPath("$.items[0].price").value(50.00))
                .andExpect(jsonPath("$.items[0].quantity").value(2L))
                .andExpect(jsonPath("$.items[0].itemTotalPrice").value(100.00));
    }

    @Test
    void getCart_NotFound() throws Exception {
        when(cartService.getCartDto(cartId)).thenThrow(new CartNotFoundException(cartId));

        mockMvc.perform(get("/api/carts/" + cartId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void addItemToCart_Success() throws Exception {
        AddItemToCartDto addDto = AddItemToCartDto.builder()
                .productId(10L)
                .quantity(2L)
                .build();

        CartDto cartDto = CartDto.builder()
                .id(cartId)
                .cartId(cartId)
                .totalPrice(new BigDecimal("100.00"))
                .items(List.of(
                        CartItemDto.builder()
                                .id(1L)
                                .productId(10L)
                                .productName("Keyboard")
                                .unitPrice(new BigDecimal("50.00"))
                                .quantity(2L)
                                .subtotal(new BigDecimal("100.00"))
                                .build()
                ))
                .build();

        when(cartService.addItemToCart(eq(cartId), any(AddItemToCartDto.class))).thenReturn(cartDto);

        mockMvc.perform(post("/api/carts/" + cartId + "/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productId").value(10L))
                .andExpect(jsonPath("$.items[0].quantity").value(2L));
    }

    @Test
    void updateItemQuantity_Success() throws Exception {
        UpdateCartItemDto updateDto = UpdateCartItemDto.builder()
                .quantity(5L)
                .build();

        CartDto cartDto = CartDto.builder()
                .id(cartId)
                .cartId(cartId)
                .totalPrice(new BigDecimal("250.00"))
                .items(List.of(
                        CartItemDto.builder()
                                .id(1L)
                                .productId(10L)
                                .quantity(5L)
                                .unitPrice(new BigDecimal("50.00"))
                                .subtotal(new BigDecimal("250.00"))
                                .build()
                ))
                .build();

        when(cartService.updateItemQuantity(cartId, 10L, 5L)).thenReturn(cartDto);

        mockMvc.perform(patch("/api/carts/" + cartId + "/items/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(5L))
                .andExpect(jsonPath("$.totalPrice").value(250.00));
    }

    @Test
    void removeItemFromCart_Success() throws Exception {
        CartDto emptyCart = CartDto.builder()
                .id(cartId)
                .cartId(cartId)
                .totalPrice(BigDecimal.ZERO)
                .items(List.of())
                .build();

        when(cartService.removeItemFromCart(cartId, 10L)).thenReturn(emptyCart);

        mockMvc.perform(delete("/api/carts/" + cartId + "/items/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }
}
