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
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private BigDecimal unitPrice;
    private Long quantity;
    private BigDecimal itemTotalPrice;
    private BigDecimal subtotal;
    private String paymentMode;
    private Integer depositPercent;

    public BigDecimal getPrice() {
        return price != null ? price : unitPrice;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice != null ? unitPrice : price;
    }

    public BigDecimal getItemTotalPrice() {
        return itemTotalPrice != null ? itemTotalPrice : subtotal;
    }

    public BigDecimal getSubtotal() {
        return subtotal != null ? subtotal : itemTotalPrice;
    }
}
