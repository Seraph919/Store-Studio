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
public class SellerOrderDto {
    private Long id;
    private Long orderId;
    private String publicOrderReference;
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal upfrontAmount;
    private BigDecimal deliveryAmount;
    private boolean upfrontPaymentConfirmed;
    private String customerName;
    private String phoneNumber;
    private String shippingAddress;
    private String city;
    private String customerEmail;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderItemDto> items;
}
