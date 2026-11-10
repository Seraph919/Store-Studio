package org.storestudio.store.dtos.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class UserDto {
    private String email;
    private String role;
}
