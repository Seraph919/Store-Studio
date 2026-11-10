package org.storestudio.store.dtos;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSectionsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Boolean showFeaturedProducts;
    private Boolean showReviews;
    private Boolean showAboutSection;
}
