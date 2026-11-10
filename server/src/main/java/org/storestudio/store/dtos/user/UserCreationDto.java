package org.storestudio.store.dtos.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserCreationDto {
    private String email;
    private String password;
    private String role;
}
