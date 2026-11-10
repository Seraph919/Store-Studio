package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {
    private Long id;
    private Long orderId;
    private Long sellerOrderId;
    private Long productId;
    private String productName;
    private String thumbnailUrl;
    private Long sellerId;
    private String sellerName;
    private Long quantity;
    private BigDecimal price;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String paymentMode;
    private Integer depositPercent;
    private BigDecimal upfrontAmount;
}
