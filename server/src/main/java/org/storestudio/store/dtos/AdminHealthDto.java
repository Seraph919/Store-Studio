package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminHealthDto {
    private String databaseStatus;
    private long databaseLatencyMs;
    private String cachingStatus;
    private long jvmMemoryUsedMb;
    private long jvmMemoryMaxMb;
    private long uptimeSeconds;
}

