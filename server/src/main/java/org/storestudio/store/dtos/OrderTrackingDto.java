package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTrackingDto {
    private String publicOrderReference;
    private String status;
    private String city;
    private BigDecimal totalPrice;
    private Instant createdAt;
    private List<TrackingItemDto> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrackingItemDto {
        private String productName;
        private Long quantity;
        private BigDecimal unitPrice;
        private String thumbnailUrl;
    }
}
