package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "seller_storefront")
public class SellerStorefront {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", unique = true, nullable = false)
    private Users seller;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "store_name", nullable = false, length = 120)
    private String storeName;

    @Column(name = "tagline", length = 255)
    private String tagline;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "hero_image_url", columnDefinition = "TEXT")
    private String heroImageUrl;

    @Column(name = "hero_title", length = 255)
    private String heroTitle;

    @Column(name = "hero_subtitle", columnDefinition = "TEXT")
    private String heroSubtitle;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'EDITORIAL'")
    @Column(name = "template_id", nullable = false, length = 30)
    @Builder.Default
    private StorefrontTemplate templateId = StorefrontTemplate.EDITORIAL;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'LIGHT'")
    @Column(name = "theme_mode", nullable = false, length = 20)
    @Builder.Default
    private StorefrontThemeMode themeMode = StorefrontThemeMode.LIGHT;

    @ColumnDefault("'#B58A56'")
    @Column(name = "accent_color", length = 20)
    @Builder.Default
    private String accentColor = "#B58A56";

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'ELEGANT'")
    @Column(name = "font_preset", nullable = false, length = 30)
    @Builder.Default
    private StorefrontFontPreset fontPreset = StorefrontFontPreset.ELEGANT;

    @ColumnDefault("true")
    @Column(name = "show_featured_products", nullable = false)
    @Builder.Default
    private Boolean showFeaturedProducts = true;

    @ColumnDefault("true")
    @Column(name = "show_reviews", nullable = false)
    @Builder.Default
    private Boolean showReviews = true;

    @ColumnDefault("false")
    @Column(name = "show_about_section", nullable = false)
    @Builder.Default
    private Boolean showAboutSection = false;

    @Column(name = "about_title", length = 255)
    private String aboutTitle;

    @Column(name = "about_text", columnDefinition = "TEXT")
    private String aboutText;

    @Column(name = "about_image_url", columnDefinition = "TEXT")
    private String aboutImageUrl;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "storefront", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<SellerStorefrontFeaturedProduct> featuredProducts = new ArrayList<>();

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
