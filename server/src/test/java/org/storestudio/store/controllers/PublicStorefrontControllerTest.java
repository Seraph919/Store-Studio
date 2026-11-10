package org.storestudio.store.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.PagedResponse;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.PublicStorefrontDto;
import org.storestudio.store.dtos.StoreHeroDto;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.services.SellerStorefrontService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PublicStorefrontControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SellerStorefrontService storefrontService;

    @InjectMocks
    private PublicStorefrontController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new org.springframework.data.web.PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getStorefront_existingSlug_returns200() throws Exception {
        PublicStorefrontDto dto = PublicStorefrontDto.builder()
                .slug("luna-jewelry")
                .storeName("Luna Jewelry")
                .tagline("Fine handmade jewelry")
                .templateId(StorefrontTemplate.EDITORIAL)
                .hero(StoreHeroDto.builder().title("Timeless Pieces").build())
                .build();

        when(storefrontService.getPublicStorefront("luna-jewelry")).thenReturn(dto);

        mockMvc.perform(get("/api/v1/stores/luna-jewelry")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("luna-jewelry"))
                .andExpect(jsonPath("$.storeName").value("Luna Jewelry"))
                .andExpect(jsonPath("$.templateId").value("EDITORIAL"));
    }

    @Test
    void getStorefront_unknownSlug_returns404() throws Exception {
        when(storefrontService.getPublicStorefront("unknown-shop"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Storefront not found: unknown-shop"));

        mockMvc.perform(get("/api/v1/stores/unknown-shop")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void getStorefrontProducts_returnsPaginatedResponse() throws Exception {
        ProductDto prod = ProductDto.builder()
                .id(1L)
                .name("Diamond Ring")
                .price(BigDecimal.valueOf(299.99))
                .build();

        PagedResponse<ProductDto> paged = new PagedResponse<>(
                List.of(prod), 0, 12, 1, 1, true
        );

        when(storefrontService.getStorefrontProducts(eq("luna-jewelry"), any(), any(), any(Pageable.class)))
                .thenReturn(paged);

        mockMvc.perform(get("/api/v1/stores/luna-jewelry/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Diamond Ring"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
