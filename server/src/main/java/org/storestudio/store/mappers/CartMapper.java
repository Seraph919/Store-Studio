package org.storestudio.store.mappers;

import org.storestudio.store.dtos.CartDto;
import org.storestudio.store.dtos.CartItemDto;
import org.storestudio.store.entities.Cart;
import org.storestudio.store.entities.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(source = "cartItems", target = "items")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "id", target = "cartId")
    @Mapping(target = "totalPrice", ignore = true)
    CartDto toDto(Cart cart);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.price", target = "unitPrice")
    @Mapping(source = "product.price", target = "price")
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "itemTotalPrice", ignore = true)
    CartItemDto toItemDto(CartItem cartItem);
}
