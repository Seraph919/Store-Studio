package org.storestudio.store.repositories;

import org.storestudio.store.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByOrderIdAndSellerId(Long orderId, Long sellerId);
    List<OrderItem> findBySellerOrderId(Long sellerOrderId);
    void deleteByOrderId(Long orderId);

    @Query("SELECT oi.product.id FROM OrderItem oi " +
            "WHERE (oi.order.status IS NULL OR UPPER(oi.order.status) <> 'CANCELLED') " +
            "AND oi.product IS NOT NULL " +
            "AND oi.product.isListed = true " +
            "AND (:isPack = true AND oi.product.isPack = true OR :isPack = false AND (oi.product.isPack = false OR oi.product.isPack IS NULL)) " +
            "GROUP BY oi.product.id " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Long> findTopOrderedProductIdsByPack(@Param("isPack") boolean isPack);
}
