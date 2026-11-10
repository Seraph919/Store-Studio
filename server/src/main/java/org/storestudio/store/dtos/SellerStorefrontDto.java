package org.storestudio.store.dtos;

import lombok.*;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontTemplate;
import org.storestudio.store.entities.StorefrontThemeMode;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerStorefrontDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long sellerId;
    private String slug;
    private String storeName;
    private String tagline;
    private String logoUrl;

    private String heroImageUrl;
    private String heroTitle;
    private String heroSubtitle;

    private StorefrontTemplate templateId;
    private StorefrontThemeMode themeMode;
    private String accentColor;
    private StorefrontFontPreset fontPreset;

    private Boolean showFeaturedProducts;
    private Boolean showReviews;
    private Boolean showAboutSection;

    private String aboutTitle;
    private String aboutText;
    private String aboutImageUrl;

    private List<Long> featuredProductIds;
    private List<ProductDto> featuredProducts;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
