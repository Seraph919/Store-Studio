package org.storestudio.store.dtos;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSummaryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private String slug;
}
