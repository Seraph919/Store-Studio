package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long quantity;
    private Short categoryId;
    private String categoryName;
    private List<String> images;
    private String videoUrl;
    private Boolean isListed;
    private String thumbnailUrl;
    private String hoverImageUrl;
    private String imageAspect;
    private String imageFit;
    private Integer imagePositionX;
    private Integer imagePositionY;
    private Integer imageZoom;
    private BigDecimal originalPrice;
    private Integer discountRate;
    private Boolean isPack;
    private String paymentMode;
    private Integer depositPercent;
    private Long sellerId;
    private StoreSummaryDto store;
}
