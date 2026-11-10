package org.storestudio.store.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.AddItemToCartDto;
import org.storestudio.store.entities.*;
import org.storestudio.store.repositories.*;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {
    @Mock CartRepository carts;
    @Mock CartItemRepository items;
    @Mock ProductRepository products;
    @Mock UserRepository users;
    @InjectMocks CartService service;

    @Test
    void rejectsQuantityOverflowWithoutWritingNegativeQuantity() {
        Cart cart = new Cart();
        cart.setId(UUID.randomUUID());
        Product product = new Product();
        product.setId(1L);
        product.setQuantity(10L);
        CartItem item = new CartItem();
        item.setQuantity(1L);
        when(carts.findById(cart.getId())).thenReturn(Optional.of(cart));
        when(products.findById(1L)).thenReturn(Optional.of(product));
        when(items.findByCartIdAndProductId(cart.getId(), 1L)).thenReturn(Optional.of(item));
        assertThrows(IllegalArgumentException.class, () -> service.addItemToCart(cart.getId(),
                AddItemToCartDto.builder().productId(1L).quantity(Long.MAX_VALUE).build()));
        assertEquals(1L, item.getQuantity());
        verify(items, never()).save(any());
    }
}
