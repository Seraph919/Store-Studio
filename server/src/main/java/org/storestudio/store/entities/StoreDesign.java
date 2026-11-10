package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "store_design")
public class StoreDesign {

    @Id
    @Column(name = "id", nullable = false)
    @Builder.Default
    private Long id = 1L;

    @Enumerated(EnumType.STRING)
    @Column(name = "template", nullable = false, length = 30)
    @Builder.Default
    private StorefrontTemplate template = StorefrontTemplate.EDITORIAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "color_mode", nullable = false, length = 20)
    @Builder.Default
    private StorefrontThemeMode colorMode = StorefrontThemeMode.LIGHT;

    @Enumerated(EnumType.STRING)
    @Column(name = "palette_id", nullable = false, length = 30)
    @Builder.Default
    private StorefrontPalette paletteId = StorefrontPalette.CHAMPAGNE;

    @Column(name = "accent_color", length = 30)
    @Builder.Default
    private String accentColor = "#F4B400";

    @Enumerated(EnumType.STRING)
    @Column(name = "font_preset", nullable = false, length = 30)
    @Builder.Default
    private StorefrontFontPreset fontPreset = StorefrontFontPreset.ELEGANT;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "design_config", columnDefinition = "jsonb", nullable = false)
    private String designConfig;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
