package org.storestudio.store.services;

import org.junit.jupiter.api.Test;
import org.storestudio.store.dtos.*;
import org.storestudio.store.entities.*;
import org.storestudio.store.repositories.StoreDesignRepository;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StoreDesignServiceTest {
    @Test void invalidDesignNeverWritesBrandingOrPublishedDesign() {
        var repository=mock(StoreDesignRepository.class);
        var settings=mock(StoreSettingsService.class);
        var validator=mock(StoreDesignValidator.class);
        var service=new StoreDesignService(repository, settings, validator);
        var request=new UpdateStoreDesignDto();
        doThrow(new IllegalArgumentException("Invalid sections")).when(validator).validate(request);
        assertThrows(IllegalArgumentException.class, () -> service.updateDesign(request));
        verifyNoInteractions(repository, settings);
    }
    @Test void brandingAndDesignAreReturnedFromSamePublish() {
        var repository=mock(StoreDesignRepository.class);
        var settings=mock(StoreSettingsService.class);
        var validator=mock(StoreDesignValidator.class);
        var service=new StoreDesignService(repository, settings, validator);
        var entity=StoreDesign.builder().id(1L).build();
        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
        when(settings.getSettings()).thenReturn(StoreSettingsDto.builder().storeName("New brand").build());
        var request=UpdateStoreDesignDto.builder().template(StorefrontTemplate.MINIMAL).colorMode(StorefrontThemeMode.DARK)
            .fontPreset(StorefrontFontPreset.MODERN).accentColor("#123456").designConfig("{\"sections\":[]}")
            .branding(StoreBrandingDto.builder().storeName("New brand").build()).build();
        var result=service.updateDesign(request);
        assertEquals("New brand", result.getBranding().getStoreName());
        assertEquals(StorefrontTemplate.MINIMAL, result.getTemplate());
        verify(settings).updateSettings(argThat(dto -> dto.getStoreName().equals("New brand")));
    }
}
