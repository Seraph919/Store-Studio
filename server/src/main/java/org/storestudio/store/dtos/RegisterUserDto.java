package org.storestudio.store.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterUserDto {

    @NotBlank(message = "UserName Cannot Be Blank")
    @Size(min = 3, max = 50, message = "UserName must be between 3 and 50 Characters Long")
    private String name;

    @NotBlank(message = "Email Must Not Be Blank")
    @Email(message = "Please Provide a Valid Email")
    private String email;

    @NotBlank(message = "A password is Required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 Characters Long")
    private String password;
}
