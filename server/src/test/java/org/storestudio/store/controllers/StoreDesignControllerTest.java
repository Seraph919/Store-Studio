package org.storestudio.store.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.StoreBrandingDto;
import org.storestudio.store.dtos.StoreDesignDto;
import org.storestudio.store.dtos.UpdateStoreDesignDto;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontPalette;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.services.StoreDesignService;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StoreDesignControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StoreDesignService storeDesignService;

    @InjectMocks
    private StoreDesignController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getPublishedDesign_returns200() throws Exception {
        StoreDesignDto dto = StoreDesignDto.builder()
                .id(1L)
                .template(StorefrontTemplate.EDITORIAL)
                .colorMode(StorefrontThemeMode.LIGHT)
                .paletteId(StorefrontPalette.CHAMPAGNE)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .designConfig("{\"sections\":[]}")
                .branding(StoreBrandingDto.builder().storeName("The Everyday Edit").build())
                .build();

        when(storeDesignService.getPublishedDesign()).thenReturn(dto);

        mockMvc.perform(get("/api/v1/store/design")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.template").value("EDITORIAL"))
                .andExpect(jsonPath("$.fontPreset").value("ELEGANT"))
                .andExpect(jsonPath("$.accentColor").value("#B58A56"))
                .andExpect(jsonPath("$.branding.storeName").value("The Everyday Edit"));
    }

    @Test
    void updateDesign_validPayload_returns200() throws Exception {
        StoreDesignDto dto = StoreDesignDto.builder()
                .template(StorefrontTemplate.EDITORIAL)
                .colorMode(StorefrontThemeMode.LIGHT)
                .paletteId(StorefrontPalette.CHAMPAGNE)
                .accentColor("#FFC300")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .designConfig("{\"sections\":[]}")
                .branding(StoreBrandingDto.builder().storeName("The Everyday Edit").build())
                .build();

        when(storeDesignService.updateDesign(any(UpdateStoreDesignDto.class))).thenReturn(dto);

        String validJson = """
            {
                "template": "EDITORIAL",
                "colorMode": "LIGHT",
                "paletteId": "CHAMPAGNE",
                "accentColor": "#FFC300",
                "fontPreset": "ELEGANT",
                "designConfig": "{\\"sections\\":[]}",
                "branding": {
                    "storeName": "The Everyday Edit"
                }
            }
            """;

        mockMvc.perform(put("/api/v1/store/design")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.template").value("EDITORIAL"))
                .andExpect(jsonPath("$.fontPreset").value("ELEGANT"));
    }

    @Test
    void updateDesign_invalidFontPreset_returns400WithMessage() throws Exception {
        // "EDITORIAL" as fontPreset is invalid and triggers HttpMessageNotReadableException
        String invalidFontJson = """
            {
                "template": "EDITORIAL",
                "colorMode": "LIGHT",
                "paletteId": "CHAMPAGNE",
                "accentColor": "#FFC300",
                "fontPreset": "EDITORIAL",
                "designConfig": "{\\"sections\\":[]}"
            }
            """;

        mockMvc.perform(put("/api/v1/store/design")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidFontJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request values. Check the template, color mode, font and JSON field types."));
    }

    @Test
    void updateDesign_missingRequiredFields_returns400() throws Exception {
        String missingFieldsJson = "{}";

        mockMvc.perform(put("/api/v1/store/design")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(missingFieldsJson))
                .andExpect(status().isBadRequest());
    }
}
