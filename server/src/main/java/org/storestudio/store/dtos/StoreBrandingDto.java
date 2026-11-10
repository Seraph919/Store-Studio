package org.storestudio.store.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.io.Serializable;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StoreBrandingDto implements Serializable {
    @NotBlank @Size(max = 120)
    private String storeName;
    @Size(max = 255)
    private String storeTagline;
    @Size(max = 2048)
    private String logoUrl;
    @Size(max = 2048)
    private String logoDarkUrl;
    private Boolean showRingSizeGuide;
}
