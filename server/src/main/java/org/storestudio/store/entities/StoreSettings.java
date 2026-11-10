package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "store_settings")
public class StoreSettings {

    @Id
    @Column(name = "id", nullable = false)
    @Builder.Default
    private Long id = 1L;

    @Column(name = "shipping_mode", nullable = false, length = 20)
    @Builder.Default
    private String shippingMode = "FREE";

    @Column(name = "shipping_fee", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private java.math.BigDecimal shippingFee = java.math.BigDecimal.ZERO;

    @Column(name = "free_shipping_threshold", precision = 10, scale = 2)
    private java.math.BigDecimal freeShippingThreshold;

    @Column(name = "store_name", length = 120)
    @Builder.Default
    private String storeName = "Store Studio";

    @Column(name = "store_tagline", length = 255)
    @Builder.Default
    private String storeTagline = "A minimal storefront starter sellers can personalize";

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "logo_dark_url", columnDefinition = "TEXT")
    private String logoDarkUrl;

    @Column(name = "show_ring_size_guide", nullable = false)
    @Builder.Default
    private boolean showRingSizeGuide = false;

    @Column(name = "phone", length = 100)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "timing", length = Integer.MAX_VALUE)
    private String timing;

    @Column(name = "address", length = Integer.MAX_VALUE)
    private String address;

    @Column(name = "hero_eyebrow", length = Integer.MAX_VALUE)
    private String heroEyebrow;

    @Column(name = "hero_title", length = Integer.MAX_VALUE)
    private String heroTitle;

    @Column(name = "hero_intro", length = Integer.MAX_VALUE)
    private String heroIntro;

    @Column(name = "hero_cta", length = Integer.MAX_VALUE)
    private String heroCta;

    @Column(name = "story1_eyebrow", length = Integer.MAX_VALUE)
    private String story1Eyebrow;

    @Column(name = "story1_title", length = Integer.MAX_VALUE)
    private String story1Title;

    @Column(name = "story1_intro", length = Integer.MAX_VALUE)
    private String story1Intro;

    @Column(name = "story1_cta", length = Integer.MAX_VALUE)
    private String story1Cta;

    @Column(name = "story1_image", length = Integer.MAX_VALUE)
    private String story1Image;

    @Column(name = "story1_product_id")
    private Long story1ProductId;

    @Column(name = "story2_eyebrow", length = Integer.MAX_VALUE)
    private String story2Eyebrow;

    @Column(name = "story2_title", length = Integer.MAX_VALUE)
    private String story2Title;

    @Column(name = "story2_intro", length = Integer.MAX_VALUE)
    private String story2Intro;

    @Column(name = "story2_cta", length = Integer.MAX_VALUE)
    private String story2Cta;

    @Column(name = "story2_image", length = Integer.MAX_VALUE)
    private String story2Image;

    @Column(name = "story2_product_id")
    private Long story2ProductId;

    @Column(name = "category_overrides", length = Integer.MAX_VALUE)
    private String categoryOverrides;

    @Column(name = "section_overrides", length = Integer.MAX_VALUE)
    private String sectionOverrides;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
