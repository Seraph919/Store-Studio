package org.storestudio.store.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSellerStorefrontDto {

    @NotBlank(message = "Store name is required")
    @Size(max = 120, message = "Store name must not exceed 120 characters")
    private String storeName;

    @NotBlank(message = "Slug is required")
    @Size(max = 100, message = "Slug must not exceed 100 characters")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
    private String slug;

    @Size(max = 255, message = "Tagline must not exceed 255 characters")
    private String tagline;

    private String logoUrl;

    private String heroImageUrl;

    @Size(max = 255, message = "Hero title must not exceed 255 characters")
    private String heroTitle;

    private String heroSubtitle;

    @NotNull(message = "Template is required")
    private StorefrontTemplate templateId;

    @NotNull(message = "Theme mode is required")
    private StorefrontThemeMode themeMode;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Accent color must be a valid hex color code (e.g. #B58A56)")
    private String accentColor;

    @NotNull(message = "Font preset is required")
    private StorefrontFontPreset fontPreset;

    private Boolean showFeaturedProducts;
    private Boolean showReviews;
    private Boolean showAboutSection;

    @Size(max = 255, message = "About title must not exceed 255 characters")
    private String aboutTitle;

    private String aboutText;
    private String aboutImageUrl;

    @Size(max = 6, message = "You may feature a maximum of 6 products")
    private List<Long> featuredProductIds;
}
