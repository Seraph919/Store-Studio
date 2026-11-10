package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSettingsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String shippingMode;
    private java.math.BigDecimal shippingFee;
    private java.math.BigDecimal freeShippingThreshold;
    private String storeName;
    private String storeTagline;
    private String logoUrl;
    private String logoDarkUrl;
    private Boolean showRingSizeGuide;

    private String phone;
    private String email;
    private String timing;
    private String address;

    private String heroEyebrow;
    private String heroTitle;
    private String heroIntro;
    private String heroCta;

    private String story1Eyebrow;
    private String story1Title;
    private String story1Intro;
    private String story1Cta;
    private String story1Image;
    private Long story1ProductId;

    private String story2Eyebrow;
    private String story2Title;
    private String story2Intro;
    private String story2Cta;
    private String story2Image;
    private Long story2ProductId;

    private String categoryOverrides;
    private String sectionOverrides;
    private Instant updatedAt;
}
