package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.storestudio.store.dtos.UpdateStoreDesignDto;
import org.storestudio.store.entities.*;
import org.storestudio.store.repositories.ProductRepository;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StoreDesignValidatorTest {
    private ProductRepository products;
    private StoreDesignValidator validator;
    @BeforeEach void setup() { products = mock(ProductRepository.class); validator = new StoreDesignValidator(products); }
    private UpdateStoreDesignDto dto(String config) {
        return UpdateStoreDesignDto.builder().template(StorefrontTemplate.EDITORIAL)
            .colorMode(StorefrontThemeMode.LIGHT).fontPreset(StorefrontFontPreset.ELEGANT)
            .accentColor("#123456").designConfig(config).build();
    }
    private String section(String settings) {
        return "{\"sections\":[{\"id\":\"hero\",\"type\":\"Hero\",\"variant\":\"layered\",\"enabled\":true,\"settings\":" + settings + "}]}";
    }
    @Test void acceptsEmptyHomepage() { assertDoesNotThrow(() -> validator.validate(dto("{\"sections\":[]}"))); }
    @Test void acceptsSafeContent() { assertDoesNotThrow(() -> validator.validate(dto(section("{\"title\":\"A store\",\"imageUrl\":\"https://images.example.com/photo.jpg\",\"overlayOpacity\":0,\"ctaLink\":\"/shop?category=Rings\"}")))); }
    @ParameterizedTest @ValueSource(strings = {"null", "[]", "{}", "{\"sections\":{}}", "{\"sections\":[null]}", "{\"sections\":[],\"css\":\"evil\"}"})
    void rejectsInvalidStructure(String json) { assertThrows(IllegalArgumentException.class, () -> validator.validate(dto(json))); }
    @ParameterizedTest @ValueSource(strings = {
        "{\"ctaLink\":\"javascript:alert(1)\"}", "{\"ctaLink\":\"//evil.example\"}",
        "{\"ctaLink\":\"/dashboard/design\"}", "{\"ctaLink\":\"/#missing\"}",
        "{\"imageUrl\":\"data:image/svg+xml,evil\"}", "{\"imageUrl\":\"http://evil.example/image\"}",
        "{\"imageUrl\":\"https://user:password@example.com/a\"}",
        "{\"overlayOpacity\":101}", "{\"overlayOpacity\":-1}", "{\"overlayOpacity\":0.5}",
        "{\"alignment\":\"up\"}", "{\"title\":\"<script>alert(1)</script>\"}",
        "{\"css\":\"position:fixed\"}", "{\"title\":{}}"
    }) void rejectsUnsafeOrUnsupportedSettings(String settings) { assertThrows(IllegalArgumentException.class, () -> validator.validate(dto(section(settings)))); }
    @Test void rejectsDuplicateIds() {
        String single = section("{}");
        String node = single.substring(single.indexOf('[') + 1, single.lastIndexOf(']'));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(dto("{\"sections\":["+node+","+node+"]}")));
    }
    @Test void validatesProductIdsAgainstCatalog() {
        String json="{\"sections\":[{\"id\":\"featured\",\"type\":\"FeaturedProducts\",\"variant\":\"editorial-grid\",\"enabled\":true,\"settings\":{\"strategy\":\"custom\",\"productIds\":[42]}}]}";
        when(products.findAllById(any())).thenReturn(List.of());
        assertThrows(IllegalArgumentException.class, () -> validator.validate(dto(json)));
        when(products.findAllById(any())).thenReturn(List.of(new Product()));
        assertDoesNotThrow(() -> validator.validate(dto(json)));
    }
    @Test void acceptsIndependentTemplateDrafts() {
        String config = """
            {"sections":[],"templateDrafts":{
              "MODERN":{"sections":[{"id":"hero","type":"Hero","variant":"fullscreen","enabled":true,
                "settings":{"title":"Modern title","imageUrl":"https://media.example.com/modern.jpg"}}],
                "colorMode":"LIGHT","paletteId":"CHAMPAGNE","accentColor":"#f4b400","fontPreset":"MODERN"},
              "MINIMAL":{"sections":[{"id":"hero","type":"Hero","variant":"fullscreen","enabled":true,
                "settings":{"title":"Minimal title","imageUrl":"https://media.example.com/minimal.jpg"}}],
                "colorMode":"DARK","paletteId":"MONOCHROME","accentColor":"#ffffff","fontPreset":"ELEGANT"}
            }}
            """;
        assertDoesNotThrow(() -> validator.validate(dto(config)));
    }
    @Test void rejectsUnsafeImagesInsideSavedTemplates() {
        String json = """
            {"sections":[],"templateDrafts":{
              "MODERN":{"sections":[{"id":"hero","type":"Hero","variant":"fullscreen","enabled":true,
                "settings":{"imageUrl":"javascript:alert(1)"}}],
                "colorMode":"LIGHT","paletteId":"CHAMPAGNE","accentColor":"#123456","fontPreset":"MODERN"}
            }}
            """;
        assertThrows(IllegalArgumentException.class, () -> validator.validate(dto(json)));
    }
    @Test void rejectsUnsupportedSavedTemplateKeys() {
        String json = """
            {"sections":[],"templateDrafts":{"UNKNOWN":{
              "sections":[],"colorMode":"LIGHT","paletteId":"CHAMPAGNE",
              "accentColor":"#123456","fontPreset":"MODERN"}}}
            """;
        assertThrows(IllegalArgumentException.class, () -> validator.validate(dto(json)));
    }
    @Test void rejectsUnsupportedVariantsAndColors() {
        assertThrows(IllegalArgumentException.class, () -> validator.validate(dto(section("{}").replace("layered", "arbitrary"))));
        var invalid=dto(section("{}")); invalid.setAccentColor("red;position:fixed");
        assertThrows(IllegalArgumentException.class, () -> validator.validate(invalid));
    }
}
