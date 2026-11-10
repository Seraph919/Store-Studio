package org.storestudio.store.repositories;

import org.storestudio.store.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi WHERE oi.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);

    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByPublicOrderReference(String publicOrderReference);
}
