package org.storestudio.store.repositories;

import org.storestudio.store.entities.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyHash(String keyHash);
    List<ApiKey> findByOwner_IdOrderByCreatedAtDesc(Long ownerId);
    Optional<ApiKey> findByIdAndOwner_Id(Long id, Long ownerId);
}
