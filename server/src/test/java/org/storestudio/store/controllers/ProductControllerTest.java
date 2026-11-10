package org.storestudio.store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.CreateProductDto;
import org.storestudio.store.dtos.PagedResponse;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.exceptions.ProductNotFoundException;
import org.storestudio.store.services.ProductService;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getProducts_Success() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Smartphone")
                .description("Flagship phone")
                .price(new BigDecimal("799.99"))
                .quantity(50L)
                .categoryName("Electronics")
                .build();

        when(productService.getPagedProducts(eq("Electronics"), any(), any(Pageable.class)))
                .thenReturn(PagedResponse.fromPage(new PageImpl<>(List.of(product))));

        mockMvc.perform(get("/api/v1/products")
                        .param("category", "Electronics")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].name").value("Smartphone"))
                .andExpect(jsonPath("$.content[0].categoryName").value("Electronics"));
    }

    @Test
    void getProducts_WithoutParams_Success() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Smartphone")
                .description("Flagship phone")
                .price(new BigDecimal("799.99"))
                .quantity(50L)
                .build();

        when(productService.getPagedProducts(eq(null), eq(null), any(Pageable.class)))
                .thenReturn(PagedResponse.fromPage(new PageImpl<>(List.of(product))));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].name").value("Smartphone"));
    }

    @Test
    void getProductById_Success() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Laptop")
                .price(new BigDecimal("1299.99"))
                .build();

        when(productService.getProductById(1L)).thenReturn(product);

        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Laptop"));
    }

    @Test
    void getProductById_NotFound() throws Exception {
        when(productService.getProductById(99L)).thenThrow(new ProductNotFoundException(99L));

        mockMvc.perform(get("/api/v1/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createProduct_Success() throws Exception {
        CreateProductDto createDto = CreateProductDto.builder()
                .name("Monitor")
                .description("4K IPS")
                .price(new BigDecimal("399.99"))
                .quantity(20L)
                .categoryName("Electronics")
                .build();

        ProductDto created = ProductDto.builder()
                .id(2L)
                .name("Monitor")
                .description("4K IPS")
                .price(new BigDecimal("399.99"))
                .quantity(20L)
                .categoryName("Electronics")
                .build();

        when(productService.createProduct(any(CreateProductDto.class), any(), any())).thenReturn(created);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.name").value("Monitor"));
    }
}
