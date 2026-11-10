package org.storestudio.store.dtos;

import lombok.*;
import org.storestudio.store.entities.StorefrontFontPreset;
import org.storestudio.store.entities.StorefrontThemeMode;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreThemeDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private StorefrontThemeMode mode;
    private String accentColor;
    private StorefrontFontPreset fontPreset;
}
