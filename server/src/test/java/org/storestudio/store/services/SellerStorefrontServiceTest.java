package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.PublicStorefrontDto;
import org.storestudio.store.dtos.SellerStorefrontDto;
import org.storestudio.store.dtos.UpdateSellerStorefrontDto;
import org.storestudio.store.entities.*;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.SellerStorefrontRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SellerStorefrontServiceTest {

    @Mock
    private SellerStorefrontRepository storefrontRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private SellerStorefrontService service;

    private Users sellerA;
    private Users sellerB;
    private SellerStorefront storefrontA;

    @BeforeEach
    void setUp() {
        sellerA = Users.builder()
                .id(1L)
                .username("sellerA")
                .email("sellerA@example.com")
                .role("SELLER")
                .build();

        sellerB = Users.builder()
                .id(2L)
                .username("sellerB")
                .email("sellerB@example.com")
                .role("SELLER")
                .build();

        storefrontA = SellerStorefront.builder()
                .id(100L)
                .seller(sellerA)
                .slug("seller-a")
                .storeName("Seller A Jewelry")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .featuredProducts(new ArrayList<>())
                .build();
    }

    @Test
    void getPublicStorefront_found_returnsDto() {
        when(storefrontRepository.findBySlug("seller-a")).thenReturn(Optional.of(storefrontA));

        PublicStorefrontDto dto = service.getPublicStorefront("seller-a");

        assertNotNull(dto);
        assertEquals("seller-a", dto.getSlug());
        assertEquals("Seller A Jewelry", dto.getStoreName());
        assertEquals(StorefrontTemplate.EDITORIAL, dto.getTemplateId());
    }

    @Test
    void getPublicStorefront_notFound_throws404() {
        when(storefrontRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.getPublicStorefront("nonexistent"));
    }

    @Test
    void updateSellerStorefront_cannotFeatureOtherSellerProduct_throwsBadRequest() {
        when(userRepository.findByEmail("sellerA@example.com")).thenReturn(Optional.of(sellerA));
        when(storefrontRepository.findBySellerId(1L)).thenReturn(Optional.of(storefrontA));
        when(storefrontRepository.existsBySlugAndIdNot("seller-a", 100L)).thenReturn(false);

        // Product belongs to Seller B
        Product productB = new Product();
        productB.setId(99L);
        productB.setUser(sellerB);

        when(productRepository.findById(99L)).thenReturn(Optional.of(productB));

        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Seller A Jewelry")
                .slug("seller-a")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .featuredProductIds(java.util.List.of(99L))
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.updateSellerStorefront("sellerA@example.com", updateDto));

        assertTrue(ex.getMessage().contains("Cannot feature a product owned by another seller"));
    }

    @Test
    void updateSellerStorefront_reservedSlug_throwsBadRequest() {
        when(userRepository.findByEmail("sellerA@example.com")).thenReturn(Optional.of(sellerA));
        when(storefrontRepository.findBySellerId(1L)).thenReturn(Optional.of(storefrontA));

        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Admin Shop")
                .slug("admin") // Reserved slug
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.updateSellerStorefront("sellerA@example.com", updateDto));

        assertTrue(ex.getMessage().contains("reserved"));
    }

    @Test
    void updateSellerStorefront_slugCollision_throwsConflict() {
        when(userRepository.findByEmail("sellerA@example.com")).thenReturn(Optional.of(sellerA));
        when(storefrontRepository.findBySellerId(1L)).thenReturn(Optional.of(storefrontA));
        when(storefrontRepository.existsBySlugAndIdNot("existing-slug", 100L)).thenReturn(true);

        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Seller A")
                .slug("existing-slug")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .build();

        assertThrows(ResponseStatusException.class,
                () -> service.updateSellerStorefront("sellerA@example.com", updateDto));
    }

    @Test
    void updateSellerStorefront_valid_savesAndReturnsDto() {
        when(userRepository.findByEmail("sellerA@example.com")).thenReturn(Optional.of(sellerA));
        when(storefrontRepository.findBySellerId(1L)).thenReturn(Optional.of(storefrontA));
        when(storefrontRepository.existsBySlugAndIdNot("new-slug", 100L)).thenReturn(false);
        when(storefrontRepository.save(any(SellerStorefront.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateSellerStorefrontDto updateDto = UpdateSellerStorefrontDto.builder()
                .storeName("Brand New Name")
                .slug("new-slug")
                .tagline("New tagline")
                .templateId(StorefrontTemplate.MODERN)
                .themeMode(StorefrontThemeMode.DARK)
                .accentColor("#123456")
                .fontPreset(StorefrontFontPreset.MODERN)
                .build();

        SellerStorefrontDto result = service.updateSellerStorefront("sellerA@example.com", updateDto);

        assertNotNull(result);
        assertEquals("new-slug", result.getSlug());
        assertEquals("Brand New Name", result.getStoreName());
        assertEquals(StorefrontTemplate.MODERN, result.getTemplateId());
        assertEquals(StorefrontThemeMode.DARK, result.getThemeMode());
    }
}
