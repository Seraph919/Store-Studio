package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.StoreSettingsDto;
import org.storestudio.store.entities.StoreSettings;
import org.storestudio.store.repositories.StoreSettingsRepository;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StoreSettingsServiceTest {

    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @InjectMocks
    private StoreSettingsService storeSettingsService;

    private StoreSettings existingSettings;

    @BeforeEach
    void setUp() {
        existingSettings = StoreSettings.builder()
                .id(1L)
                .storeName("Original Store")
                .shippingMode("FREE")
                .shippingFee(BigDecimal.ZERO)
                .build();
    }

    @Test
    void getSettings_whenExists_returnsDto() {
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(existingSettings));

        StoreSettingsDto result = storeSettingsService.getSettings();

        assertNotNull(result);
        assertEquals("Original Store", result.getStoreName());
        assertEquals("FREE", result.getShippingMode());
    }

    @Test
    void getSettings_whenNotExists_returnsDefaultDto() {
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.empty());

        StoreSettingsDto result = storeSettingsService.getSettings();

        assertNotNull(result);
        assertEquals("FREE", result.getShippingMode());
    }

    @Test
    void updateSettings_validShippingModeFlat_updatesAndSaves() {
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(existingSettings));
        when(storeSettingsRepository.save(any(StoreSettings.class))).thenAnswer(i -> i.getArgument(0));

        StoreSettingsDto updateDto = StoreSettingsDto.builder()
                .storeName("Updated Brand")
                .shippingMode("FLAT")
                .shippingFee(new BigDecimal("35.00"))
                .build();

        StoreSettingsDto result = storeSettingsService.updateSettings(updateDto);

        assertNotNull(result);
        assertEquals("Updated Brand", result.getStoreName());
        assertEquals("FLAT", result.getShippingMode());
        assertEquals(new BigDecimal("35.00"), result.getShippingFee());
        verify(storeSettingsRepository).save(existingSettings);
    }

    @Test
    void updateSettings_invalidShippingMode_throwsException() {
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(existingSettings));

        StoreSettingsDto updateDto = StoreSettingsDto.builder()
                .shippingMode("UNKNOWN_MODE")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> storeSettingsService.updateSettings(updateDto));
        assertEquals("Invalid shipping mode", ex.getMessage());
        verify(storeSettingsRepository, never()).save(any());
    }

    @Test
    void updateSettings_negativeShippingFee_throwsException() {
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(existingSettings));

        StoreSettingsDto updateDto = StoreSettingsDto.builder()
                .shippingFee(new BigDecimal("-10.00"))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> storeSettingsService.updateSettings(updateDto));
        assertTrue(ex.getMessage().contains("nonnegative amount"));
    }

    @Test
    void updateSettings_freeAboveWithoutThreshold_throwsException() {
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(existingSettings));

        StoreSettingsDto updateDto = StoreSettingsDto.builder()
                .shippingMode("FREE_ABOVE")
                .freeShippingThreshold(null)
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> storeSettingsService.updateSettings(updateDto));
        assertTrue(ex.getMessage().contains("Free shipping threshold is required for FREE_ABOVE mode"));
    }
}
