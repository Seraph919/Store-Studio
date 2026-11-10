package org.storestudio.store.dtos;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreHeroDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String imageUrl;
    private String title;
    private String subtitle;
}
