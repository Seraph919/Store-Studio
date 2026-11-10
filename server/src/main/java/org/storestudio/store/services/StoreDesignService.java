package org.storestudio.store.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.storestudio.store.dtos.StoreDesignDto;
import org.storestudio.store.dtos.UpdateStoreDesignDto;
import org.storestudio.store.entities.StoreDesign;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;
import org.storestudio.store.repositories.StoreDesignRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoreDesignService {

    private final StoreDesignRepository storeDesignRepository;
    private final StoreSettingsService storeSettingsService;
    private final StoreDesignValidator validator;

    @Transactional
    @Cacheable(value = "storeDesign", key = "'published'")
    public StoreDesignDto getPublishedDesign() {
        return storeDesignRepository.findById(1L)
                .map(this::toDto)
                .orElseGet(() -> {
                    StoreDesign defaultDesign = createDefaultEntity();
                    return toDto(storeDesignRepository.save(defaultDesign));
                });
    }

    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
        @CacheEvict(value = "storeDesign", allEntries = true),
        @CacheEvict(value = "storeSettings", allEntries = true)
    })
    public StoreDesignDto updateDesign(UpdateStoreDesignDto dto) {
        validator.validate(dto);

        StoreDesign design = storeDesignRepository.findById(1L)
                .orElseGet(this::createDefaultEntity);

        design.setTemplate(dto.getTemplate() != null ? dto.getTemplate() : StorefrontTemplate.MINIMAL);
        design.setColorMode(dto.getColorMode() != null ? dto.getColorMode() : StorefrontThemeMode.LIGHT);
        design.setPaletteId(dto.getPaletteId() == null ? org.storestudio.store.entities.StorefrontPalette.CHAMPAGNE : dto.getPaletteId());
        design.setAccentColor(dto.getAccentColor() != null ? dto.getAccentColor().trim() : "#F4B400");
        design.setFontPreset(dto.getFontPreset() != null ? dto.getFontPreset() : StorefrontFontPreset.ELEGANT);
        design.setDesignConfig(dto.getDesignConfig());
        design.setUpdatedAt(Instant.now());

        if (dto.getBranding() != null) {
            var branding = dto.getBranding();
            storeSettingsService.updateSettings(org.storestudio.store.dtos.StoreSettingsDto.builder()
                    .storeName(branding.getStoreName()).storeTagline(branding.getStoreTagline())
                    .logoUrl(branding.getLogoUrl()).logoDarkUrl(branding.getLogoDarkUrl())
                    .showRingSizeGuide(branding.getShowRingSizeGuide()).build());
        }
        StoreDesign saved = storeDesignRepository.saveAndFlush(design);
        log.info("Updated published store design. Template: {}, Mode: {}, Accent: {}",
                saved.getTemplate(), saved.getColorMode(), saved.getAccentColor());
        return toDto(saved);
    }

    public StoreDesignDto toDto(StoreDesign entity) {
        var settings = storeSettingsService.getSettings();
        return StoreDesignDto.builder()
                .branding(org.storestudio.store.dtos.StoreBrandingDto.builder()
                    .storeName(settings.getStoreName()).storeTagline(settings.getStoreTagline())
                    .logoUrl(settings.getLogoUrl()).logoDarkUrl(settings.getLogoDarkUrl())
                    .showRingSizeGuide(settings.getShowRingSizeGuide()).build())
                .id(entity.getId())
                .template(entity.getTemplate())
                .colorMode(entity.getColorMode())
                .paletteId(entity.getPaletteId())
                .accentColor(entity.getAccentColor())
                .fontPreset(entity.getFontPreset())
                .designConfig(entity.getDesignConfig())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private StoreDesign createDefaultEntity() {
        String defaultConfig = """
            {
              "sections": [
                {
                  "id": "hero",
                  "type": "Hero",
                  "variant": "fullscreen",
                  "enabled": true,
                  "settings": {
                    "eyebrow": "store studio",
                    "title": "Launch a clean storefront, then make it yours",
                    "intro": "Start with a bright, minimal storefront and a neutral identity. Sellers can later swap the logo, colors, content, and structure to match their own brand.",
                    "cta": "Browse catalog",
                    "ctaLink": "/shop",
                    "imageUrl": "",
                    "cutoutImage": "",
                    "alignment": "center",
                    "overlayOpacity": 0
                  }
                },
                {
                  "id": "categories",
                  "type": "Categories",
                  "variant": "cards",
                  "enabled": true,
                  "settings": {
                    "title": "Browse by category",
                    "subtitle": "Start shoppers with a simple path into the catalog."
                  }
                },
                {
                  "id": "featured-products",
                  "type": "FeaturedProducts",
                  "variant": "editorial-grid",
                  "enabled": true,
                  "settings": {
                    "title": "Featured products",
                    "subtitle": "Highlight the products you want visitors to discover first.",
                    "strategy": "featured",
                    "columns": 4,
                    "maxProducts": 8
                  }
                },
                {
                  "id": "brand-story",
                  "type": "BrandStory",
                  "variant": "split-right",
                  "enabled": true,
                  "settings": {
                    "eyebrow": "brand story",
                    "title": "Tell your story with clarity",
                    "description": "Use this section to introduce the business, explain what makes the catalog special, and build trust without overwhelming the page.",
                    "cta": "Learn more",
                    "ctaLink": "/shop",
                    "imageUrl": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
                  }
                },
                {
                  "id": "packs-showcase",
                  "type": "ProductCollection",
                  "variant": "curated-packs",
                  "enabled": true,
                  "settings": {
                    "title": "Collections & packs",
                    "subtitle": "Group related products into clear, browsable collections.",
                    "strategy": "packs",
                    "columns": 4,
                    "maxProducts": 4
                  }
                },
                {
                  "id": "reviews",
                  "type": "Reviews",
                  "variant": "grid",
                  "enabled": true,
                  "settings": {
                    "eyebrow": "customer feedback",
                    "title": "What customers are saying",
                    "subtitle": "Social proof and reviews can sit here once the store starts collecting feedback."
                  }
                }
              ]
            }
            """;

        return StoreDesign.builder()
                .id(1L)
                .template(StorefrontTemplate.MINIMAL)
                .colorMode(StorefrontThemeMode.LIGHT)
                .accentColor("#F4B400")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .designConfig(defaultConfig.trim())
                .updatedAt(Instant.now())
                .build();
    }
}
