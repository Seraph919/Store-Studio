package org.storestudio.store.repositories;

import jakarta.persistence.LockModeType;
import org.storestudio.store.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    default Page<Product> searchProducts(String category, String search, Pageable pageable) {
        return findAll(ProductSpecifications.filter(category, search, true), pageable);
    }

    default Page<Product> searchAllProducts(String category, String search, Pageable pageable) {
        return findAll(ProductSpecifications.filter(category, search, false), pageable);
    }

    List<Product> findByUserIdOrderByIdDesc(Long userId);

    List<Product> findByUserIdAndQuantityLessThanEqualOrderByIdDesc(Long userId, Long quantity);

    long countByIsListedTrue();

    List<Product> findAllByOrderByIdDesc();

    long countByCategoryId(Short categoryId);

    // One query for storefront category counts. Hidden products are not shown in
    // public lists and must not be included in their visible product counts.
    @Query("SELECT p.category.id, COUNT(p) FROM Product p " +
            "WHERE p.isListed = true AND p.category IS NOT NULL GROUP BY p.category.id")
    List<Object[]> countListedProductsByCategory();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id IN :ids ORDER BY p.id ASC")
    List<Product> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);

    @Query("SELECT p FROM Product p " +
            "WHERE p.isListed = true " +
            "AND (:isPack = true AND p.isPack = true OR :isPack = false AND (p.isPack = false OR p.isPack IS NULL)) " +
            "ORDER BY p.id DESC")
    List<Product> findLatestByPack(@Param("isPack") boolean isPack, Pageable pageable);

    @Query("SELECT p FROM Product p " +
            "WHERE p.isListed = true AND p.category.id = :categoryId AND p.id <> :excludeId " +
            "ORDER BY p.id DESC")
    List<Product> findRelatedByCategory(
            @Param("categoryId") Short categoryId,
            @Param("excludeId") Long excludeId,
            Pageable pageable);

    @Query("SELECT p FROM Product p " +
            "WHERE p.isListed = true AND p.id NOT IN :excludeIds " +
            "ORDER BY p.id DESC")
    List<Product> findFallbackListed(
            @Param("excludeIds") Collection<Long> excludeIds,
            Pageable pageable);
}
