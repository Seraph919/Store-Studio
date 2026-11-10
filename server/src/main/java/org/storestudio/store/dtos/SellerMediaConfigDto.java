package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerMediaConfigDto {
    private String thumbnailUrl;
    private String hoverImageUrl;
    private String imageAspect;
    private String imageFit;
    private Integer imagePositionX;
    private Integer imagePositionY;
    private Integer imageZoom;
    private Boolean isListed;
    private List<String> images;
}

