package org.storestudio.store.repositories;

import org.storestudio.store.entities.SellerStorefront;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SellerStorefrontRepository extends JpaRepository<SellerStorefront, Long> {

    Optional<SellerStorefront> findBySlug(String slug);

    Optional<SellerStorefront> findBySellerId(Long sellerId);

    @Query("SELECT s FROM SellerStorefront s WHERE s.seller.email = :email")
    Optional<SellerStorefront> findBySellerEmail(@Param("email") String email);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
