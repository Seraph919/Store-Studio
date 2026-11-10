package org.storestudio.store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.SellerStorefrontDto;
import org.storestudio.store.dtos.UpdateSellerStorefrontDto;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.services.SellerStorefrontService;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SellerStorefrontControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private SellerStorefrontService storefrontService;

    @InjectMocks
    private SellerStorefrontController controller;

    private Authentication sellerAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sellerAuth = new UsernamePasswordAuthenticationToken(
                "seller@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_SELLER"))
        );
    }

    @Test
    void getStorefront_authenticatedSeller_returnsStorefront() throws Exception {
        SellerStorefrontDto dto = SellerStorefrontDto.builder()
                .id(1L)
                .sellerId(10L)
                .slug("seller-atelier")
                .storeName("Seller Atelier")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .build();

        when(storefrontService.getOrCreateSellerStorefront("seller@example.com")).thenReturn(dto);

        mockMvc.perform(get("/api/v1/seller/storefront")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("seller-atelier"))
                .andExpect(jsonPath("$.storeName").value("Seller Atelier"));
    }

    @Test
    void updateStorefront_validPayload_updatesSuccessfully() throws Exception {
        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Updated Studio")
                .slug("updated-studio")
                .tagline("New tagline")
                .templateId(StorefrontTemplate.MINIMAL)
                .themeMode(StorefrontThemeMode.DARK)
                .accentColor("#000000")
                .fontPreset(StorefrontFontPreset.MODERN)
                .showFeaturedProducts(true)
                .showReviews(true)
                .showAboutSection(true)
                .aboutTitle("About Us")
                .aboutText("Handcrafting gold since 2018")
                .featuredProductIds(List.of(1L, 2L))
                .build();

        SellerStorefrontDto resultDto = SellerStorefrontDto.builder()
                .id(1L)
                .sellerId(10L)
                .slug("updated-studio")
                .storeName("Updated Studio")
                .templateId(StorefrontTemplate.MINIMAL)
                .themeMode(StorefrontThemeMode.DARK)
                .accentColor("#000000")
                .fontPreset(StorefrontFontPreset.MODERN)
                .build();

        when(storefrontService.updateSellerStorefront(eq("seller@example.com"), any(UpdateSellerStorefrontDto.class)))
                .thenReturn(resultDto);

        mockMvc.perform(put("/api/v1/seller/storefront")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("updated-studio"))
                .andExpect(jsonPath("$.templateId").value("MINIMAL"))
                .andExpect(jsonPath("$.themeMode").value("DARK"));
    }

    @Test
    void updateStorefront_invalidHexColor_returns400() throws Exception {
        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Studio")
                .slug("valid-slug")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("invalid-color-not-hex")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .build();

        mockMvc.perform(put("/api/v1/seller/storefront")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateStorefront_invalidSlugWithSpaces_returns400() throws Exception {
        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Studio")
                .slug("invalid slug with spaces")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#FFFFFF")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .build();

        mockMvc.perform(put("/api/v1/seller/storefront")
                        .principal(sellerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());
    }
}
