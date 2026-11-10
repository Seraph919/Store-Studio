package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerKpiDto {
    private long pendingCallConfirmationsCount;
    private BigDecimal todayRevenue;
    private BigDecimal monthRevenue;
    private Map<String, Long> ordersByStatus;
    private List<ProductDto> lowStockProducts;
}

