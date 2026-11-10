package org.storestudio.store.repositories;

import org.storestudio.store.entities.StoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreSettingsRepository extends JpaRepository<StoreSettings, Long> {
}
