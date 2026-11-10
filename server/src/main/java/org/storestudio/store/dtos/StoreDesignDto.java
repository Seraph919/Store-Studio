package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;
import org.storestudio.store.entities.StorefrontPalette;

import java.io.Serializable;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreDesignDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private StorefrontTemplate template;
    private StorefrontThemeMode colorMode;
    private StorefrontPalette paletteId;
    private String accentColor;
    private StorefrontFontPreset fontPreset;
    private String designConfig;
    private StoreBrandingDto branding;
    private Instant updatedAt;
}
