package org.storestudio.store.repositories;

import org.storestudio.store.entities.StoreDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreDesignRepository extends JpaRepository<StoreDesign, Long> {
}
