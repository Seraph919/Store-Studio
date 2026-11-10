package org.storestudio.store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.CreateOrderDto;
import org.storestudio.store.dtos.OrderDto;
import org.storestudio.store.dtos.OrderItemDto;
import org.storestudio.store.exceptions.EmptyCartException;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.exceptions.OrderNotFoundException;
import org.storestudio.store.services.OrderService;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private final UUID cartId = UUID.randomUUID();
    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(orderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        auth = new UsernamePasswordAuthenticationToken(
                "admin@example.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }

    @Test
    void createOrder_Success() throws Exception {
        CreateOrderDto createDto = CreateOrderDto.builder()
                .cartId(cartId)
                .guestName("Alice")
                .phoneNumber("1234567890")
                .shippingAddress("123 Main St")
                .city("Springfield")
                .guestEmail("alice@example.com")
                .build();

        OrderDto orderDto = OrderDto.builder()
                .id(1L)
                .guestName("Alice")
                .phoneNumber("1234567890")
                .shippingAddress("123 Main St")
                .city("Springfield")
                .guestEmail("alice@example.com")
                .totalPrice(new BigDecimal("150.00"))
                .status("PENDING")
                .createdAt(Instant.now())
                .items(List.of(
                        OrderItemDto.builder()
                                .id(1L)
                                .productId(5L)
                                .productName("Coffee Maker")
                                .sellerId(2L)
                                .quantity(1L)
                                .price(new BigDecimal("150.00"))
                                .subtotal(new BigDecimal("150.00"))
                                .build()
                ))
                .build();

        when(orderService.createOrder(any(CreateOrderDto.class))).thenReturn(orderDto);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalPrice").value(150.00))
                .andExpect(jsonPath("$.items[0].sellerId").value(2L));
    }

    @Test
    void createOrder_EmptyCart_ReturnsBadRequest() throws Exception {
        CreateOrderDto createDto = CreateOrderDto.builder()
                .cartId(cartId)
                .guestName("Alice")
                .phoneNumber("1234567890")
                .shippingAddress("123 Main St")
                .city("Springfield")
                .build();

        when(orderService.createOrder(any(CreateOrderDto.class)))
                .thenThrow(new EmptyCartException("Shopping cart is empty. Add items before creating an order."));

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Shopping cart is empty. Add items before creating an order."));
    }

    @Test
    void createOrder_MissingCartId_ReturnsBadRequest() throws Exception {
        CreateOrderDto createDto = CreateOrderDto.builder()
                .guestName("Alice")
                .phoneNumber("1234567890")
                .shippingAddress("123 Main St")
                .city("Springfield")
                .build();

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getOrderById_Unauthenticated_ReturnsUnauthorized() throws Exception {
        // Unauthenticated access to numeric ID must be rejected to prevent enumeration of customer PII
        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getOrderById_Authenticated_Success() throws Exception {
        OrderDto orderDto = OrderDto.builder()
                .id(1L)
                .status("PENDING")
                .totalPrice(new BigDecimal("150.00"))
                .build();

        when(orderService.getOrderById(eq(1L), eq("admin@example.com"))).thenReturn(orderDto);

        mockMvc.perform(get("/api/orders/1").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getOrderById_NotFound() throws Exception {
        when(orderService.getOrderById(eq(99L), eq("admin@example.com")))
                .thenThrow(new OrderNotFoundException(99L));

        mockMvc.perform(get("/api/orders/99").principal(auth))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

}
