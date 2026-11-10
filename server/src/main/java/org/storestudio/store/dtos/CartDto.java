package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {
    private UUID id;
    private UUID cartId;
    private Long userId;
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    @Builder.Default
    private BigDecimal totalPrice = BigDecimal.ZERO;

    public UUID getCartId() {
        return cartId != null ? cartId : id;
    }
}
