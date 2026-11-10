package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsDto {
    private BigDecimal gmv;
    private BigDecimal platformRevenue;
    private long totalRegisteredSellers;
    private long totalVisits;
    private long totalOrders;
    private double visitOrderConversionRate;
    private long totalActiveListings;
    private double fulfillmentConversionRate;
    private Map<String, Long> ordersByStatus;
}

