package org.storestudio.store.services;

import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.StoreSettingsDto;
import org.storestudio.store.entities.StoreSettings;
import org.storestudio.store.repositories.StoreSettingsRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@AllArgsConstructor
public class StoreSettingsService {

    private final StoreSettingsRepository storeSettingsRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "storeSettings", key = "'current'")
    public StoreSettingsDto getSettings() {
        return storeSettingsRepository.findById(1L)
                .map(this::toDto)
                .orElseGet(this::getDefaultDto);
    }

    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
        @CacheEvict(value = "storeSettings", allEntries = true),
        @CacheEvict(value = "storeDesign", allEntries = true)
    })
    public StoreSettingsDto updateSettings(StoreSettingsDto dto) {
        StoreSettings settings = storeSettingsRepository.findById(1L)
                .orElseGet(this::createDefaultEntity);

        // Store-wide shipping policy. The backend is authoritative for checkout totals.
        if (dto.getShippingMode() != null) {
            if (!java.util.Set.of("FREE", "FLAT", "FREE_ABOVE").contains(dto.getShippingMode())) {
                throw new IllegalArgumentException("Invalid shipping mode");
            }
            settings.setShippingMode(dto.getShippingMode());
        }
        if (dto.getShippingFee() != null) {
            if (dto.getShippingFee().signum() < 0 || dto.getShippingFee().scale() > 2) {
                throw new IllegalArgumentException("Shipping fee must be a nonnegative amount with at most 2 decimals");
            }
            settings.setShippingFee(dto.getShippingFee());
        }
        if (dto.getFreeShippingThreshold() != null) {
            if (dto.getFreeShippingThreshold().signum() <= 0 || dto.getFreeShippingThreshold().scale() > 2) {
                throw new IllegalArgumentException("Free shipping threshold must be positive with at most 2 decimals");
            }
            settings.setFreeShippingThreshold(dto.getFreeShippingThreshold());
        }
        String resultingMode = settings.getShippingMode();
        if ("FREE_ABOVE".equals(resultingMode) && (settings.getFreeShippingThreshold() == null || settings.getFreeShippingThreshold().signum() <= 0)) {
            throw new IllegalArgumentException("Free shipping threshold is required for FREE_ABOVE mode");
        }

        if (dto.getStoreName() != null && !dto.getStoreName().isBlank()) settings.setStoreName(dto.getStoreName().trim());
        if (dto.getStoreTagline() != null) settings.setStoreTagline(dto.getStoreTagline().trim());
        if (dto.getLogoUrl() != null) settings.setLogoUrl(dto.getLogoUrl().trim());
        if (dto.getLogoDarkUrl() != null) settings.setLogoDarkUrl(dto.getLogoDarkUrl().trim());
        if (dto.getShowRingSizeGuide() != null) settings.setShowRingSizeGuide(dto.getShowRingSizeGuide());

        if (dto.getPhone() != null && !dto.getPhone().isBlank()) settings.setPhone(dto.getPhone().trim());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) settings.setEmail(dto.getEmail().trim());
        if (dto.getTiming() != null && !dto.getTiming().isBlank()) settings.setTiming(dto.getTiming().trim());
        if (dto.getAddress() != null && !dto.getAddress().isBlank()) settings.setAddress(dto.getAddress().trim());

        if (dto.getHeroEyebrow() != null && !dto.getHeroEyebrow().isBlank()) settings.setHeroEyebrow(dto.getHeroEyebrow().trim());
        if (dto.getHeroTitle() != null && !dto.getHeroTitle().isBlank()) settings.setHeroTitle(dto.getHeroTitle().trim());
        if (dto.getHeroIntro() != null && !dto.getHeroIntro().isBlank()) settings.setHeroIntro(dto.getHeroIntro().trim());
        if (dto.getHeroCta() != null && !dto.getHeroCta().isBlank()) settings.setHeroCta(dto.getHeroCta().trim());

        if (dto.getStory1Eyebrow() != null && !dto.getStory1Eyebrow().isBlank()) settings.setStory1Eyebrow(dto.getStory1Eyebrow().trim());
        if (dto.getStory1Title() != null && !dto.getStory1Title().isBlank()) settings.setStory1Title(dto.getStory1Title().trim());
        if (dto.getStory1Intro() != null && !dto.getStory1Intro().isBlank()) settings.setStory1Intro(dto.getStory1Intro().trim());
        if (dto.getStory1Cta() != null && !dto.getStory1Cta().isBlank()) settings.setStory1Cta(dto.getStory1Cta().trim());
        if (dto.getStory1Image() != null) settings.setStory1Image(dto.getStory1Image().trim());
        if (dto.getStory1ProductId() != null) settings.setStory1ProductId(dto.getStory1ProductId());

        if (dto.getStory2Eyebrow() != null && !dto.getStory2Eyebrow().isBlank()) settings.setStory2Eyebrow(dto.getStory2Eyebrow().trim());
        if (dto.getStory2Title() != null && !dto.getStory2Title().isBlank()) settings.setStory2Title(dto.getStory2Title().trim());
        if (dto.getStory2Intro() != null && !dto.getStory2Intro().isBlank()) settings.setStory2Intro(dto.getStory2Intro().trim());
        if (dto.getStory2Cta() != null && !dto.getStory2Cta().isBlank()) settings.setStory2Cta(dto.getStory2Cta().trim());
        if (dto.getStory2Image() != null) settings.setStory2Image(dto.getStory2Image().trim());
        if (dto.getStory2ProductId() != null) settings.setStory2ProductId(dto.getStory2ProductId());

        if (dto.getCategoryOverrides() != null) {
            settings.setCategoryOverrides(dto.getCategoryOverrides());
        }
        if (dto.getSectionOverrides() != null) {
            settings.setSectionOverrides(dto.getSectionOverrides());
        }

        settings.setUpdatedAt(Instant.now());
        StoreSettings saved = storeSettingsRepository.save(settings);
        return toDto(saved);
    }

    private StoreSettings createDefaultEntity() {
        StoreSettingsDto d = getDefaultDto();
        return StoreSettings.builder()
                .id(1L)
                .shippingMode("FREE")
                .shippingFee(java.math.BigDecimal.ZERO)
                .phone(d.getPhone())
                .email(d.getEmail())
                .timing(d.getTiming())
                .address(d.getAddress())
                .heroEyebrow(d.getHeroEyebrow())
                .heroTitle(d.getHeroTitle())
                .heroIntro(d.getHeroIntro())
                .heroCta(d.getHeroCta())
                .showRingSizeGuide(false)
                .story1Eyebrow(d.getStory1Eyebrow())
                .story1Title(d.getStory1Title())
                .story1Intro(d.getStory1Intro())
                .story1Cta(d.getStory1Cta())
                .story2Eyebrow(d.getStory2Eyebrow())
                .story2Title(d.getStory2Title())
                .story2Intro(d.getStory2Intro())
                .story2Cta(d.getStory2Cta())
                .updatedAt(Instant.now())
                .build();
    }

    public StoreSettingsDto toDto(StoreSettings s) {
        StoreSettingsDto defaults = getDefaultDto();
        return StoreSettingsDto.builder()
                .shippingMode(s.getShippingMode() != null ? s.getShippingMode() : "FREE")
                .shippingFee(s.getShippingFee() != null ? s.getShippingFee() : java.math.BigDecimal.ZERO)
                .freeShippingThreshold(s.getFreeShippingThreshold())
                .storeName(s.getStoreName() != null ? s.getStoreName() : defaults.getStoreName())
                .storeTagline(s.getStoreTagline() != null ? s.getStoreTagline() : defaults.getStoreTagline())
                .logoUrl(s.getLogoUrl() != null ? s.getLogoUrl() : defaults.getLogoUrl())
                .logoDarkUrl(s.getLogoDarkUrl() != null ? s.getLogoDarkUrl() : defaults.getLogoDarkUrl())
                .showRingSizeGuide(s.isShowRingSizeGuide())
                .phone(s.getPhone() != null ? s.getPhone() : defaults.getPhone())
                .email(s.getEmail() != null ? s.getEmail() : defaults.getEmail())
                .timing(s.getTiming() != null ? s.getTiming() : defaults.getTiming())
                .address(s.getAddress() != null ? s.getAddress() : defaults.getAddress())
                .heroEyebrow(s.getHeroEyebrow() != null ? s.getHeroEyebrow() : defaults.getHeroEyebrow())
                .heroTitle(s.getHeroTitle() != null ? s.getHeroTitle() : defaults.getHeroTitle())
                .heroIntro(s.getHeroIntro() != null ? s.getHeroIntro() : defaults.getHeroIntro())
                .heroCta(s.getHeroCta() != null ? s.getHeroCta() : defaults.getHeroCta())
                .story1Eyebrow(s.getStory1Eyebrow() != null ? s.getStory1Eyebrow() : defaults.getStory1Eyebrow())
                .story1Title(s.getStory1Title() != null ? s.getStory1Title() : defaults.getStory1Title())
                .story1Intro(s.getStory1Intro() != null ? s.getStory1Intro() : defaults.getStory1Intro())
                .story1Cta(s.getStory1Cta() != null ? s.getStory1Cta() : defaults.getStory1Cta())
                .story1Image(s.getStory1Image())
                .story1ProductId(s.getStory1ProductId())
                .story2Eyebrow(s.getStory2Eyebrow() != null ? s.getStory2Eyebrow() : defaults.getStory2Eyebrow())
                .story2Title(s.getStory2Title() != null ? s.getStory2Title() : defaults.getStory2Title())
                .story2Intro(s.getStory2Intro() != null ? s.getStory2Intro() : defaults.getStory2Intro())
                .story2Cta(s.getStory2Cta() != null ? s.getStory2Cta() : defaults.getStory2Cta())
                .story2Image(s.getStory2Image())
                .story2ProductId(s.getStory2ProductId())
                .categoryOverrides(s.getCategoryOverrides())
                .sectionOverrides(s.getSectionOverrides())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    private StoreSettingsDto getDefaultDto() {
        return StoreSettingsDto.builder()
                .shippingMode("FREE")
                .shippingFee(java.math.BigDecimal.ZERO)
                .storeName("Store Studio")
                .storeTagline("A minimal storefront starter sellers can personalize")
                .logoUrl(null)
                .logoDarkUrl(null)
                .showRingSizeGuide(false)
                .phone("")
                .email("")
                .timing("")
                .address("")
                .heroEyebrow("store studio")
                .heroTitle("Launch a clean storefront that feels like your brand")
                .heroIntro("Start with a calm, minimal storefront foundation. Sellers can replace the default identity, update the logo, and customize every section to match their business.")
                .heroCta("Explore the store")
                .story1Eyebrow("simple by default")
                .story1Title("A storefront that starts clean")
                .story1Intro("No layered hero composition, no heavy visual noise, and no locked-in brand. Sellers can keep the starter identity or replace it with their own.")
                .story1Cta("See featured products")
                .story2Eyebrow("made to adapt")
                .story2Title("Ready for customization")
                .story2Intro("From colors and sections to logo and hero copy, the base experience is neutral so each seller can turn it into their own storefront without reworking the whole platform.")
                .story2Cta("Customize the experience")
                .updatedAt(Instant.now())
                .build();
    }
}
