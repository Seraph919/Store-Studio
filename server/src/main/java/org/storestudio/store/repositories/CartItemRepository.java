package org.storestudio.store.repositories;

import org.storestudio.store.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(UUID cartId, Long productId);
    void deleteByCartId(UUID cartId);
    void deleteByCartIdAndProductId(UUID cartId, Long productId);
}
