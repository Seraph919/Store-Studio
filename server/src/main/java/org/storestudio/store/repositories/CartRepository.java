package org.storestudio.store.repositories;

import org.storestudio.store.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Cart> findFirstByUserEmailOrderByCreatedAtDesc(String email);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.product WHERE c.id = :id")
    Optional<Cart> findByIdWithItems(@Param("id") UUID id);
}
