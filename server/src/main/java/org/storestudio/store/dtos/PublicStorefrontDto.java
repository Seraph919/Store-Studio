package org.storestudio.store.dtos;

import lombok.*;
import org.storestudio.store.entities.StorefrontTemplate;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicStorefrontDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String slug;
    private String storeName;
    private String tagline;
    private String logoUrl;
    private StoreHeroDto hero;
    private StorefrontTemplate templateId;
    private StoreThemeDto theme;
    private StoreSectionsDto sections;
    private StoreAboutDto about;
    private List<ProductDto> featuredProducts;
}
