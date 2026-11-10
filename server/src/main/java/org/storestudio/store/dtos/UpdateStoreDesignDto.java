package org.storestudio.store.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;
import org.storestudio.store.entities.StorefrontPalette;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStoreDesignDto {

    @NotNull(message = "Template is required")
    private StorefrontTemplate template;

    @NotNull(message = "Theme color mode is required")
    private StorefrontThemeMode colorMode;
    private StorefrontPalette paletteId;

    @NotBlank(message = "Accent color is required")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Accent color must be a valid hex color code (e.g. #B58A56)")
    private String accentColor;

    @NotNull(message = "Font preset is required")
    private StorefrontFontPreset fontPreset;

    @NotBlank(message = "Design configuration JSON is required")
    private String designConfig;

    @jakarta.validation.Valid
    private StoreBrandingDto branding;
}
