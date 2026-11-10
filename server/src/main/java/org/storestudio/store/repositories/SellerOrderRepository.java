package org.storestudio.store.repositories;

import org.storestudio.store.entities.SellerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrder, Long> {

    List<SellerOrder> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<SellerOrder> findByOrderId(Long orderId);

    Optional<SellerOrder> findByIdAndSellerId(Long id, Long sellerId);

    Optional<SellerOrder> findByOrderIdAndSellerId(Long orderId, Long sellerId);

    long countBySellerIdAndStatus(Long sellerId, String status);

    @Query("SELECT so FROM SellerOrder so JOIN FETCH so.order o WHERE so.seller.id = :sellerId ORDER BY so.createdAt DESC")
    List<SellerOrder> findBySellerIdWithOrder(@Param("sellerId") Long sellerId);

    @Query("SELECT so FROM SellerOrder so JOIN FETCH so.order o ORDER BY so.createdAt DESC")
    List<SellerOrder> findAllWithOrder();
}
