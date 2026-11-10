package org.storestudio.store.dtos;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreAboutDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String title;
    private String text;
    private String imageUrl;
}
