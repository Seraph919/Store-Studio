package org.storestudio.store.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.storestudio.store.dtos.user.UserCreationDto;
import org.storestudio.store.dtos.user.UserDto;
import org.storestudio.store.entities.Users;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "carts", ignore = true)
    @Mapping(target = "products", ignore = true)
    Users UserCreationDtoToUser(UserCreationDto userDto);

    UserDto userToUserDto(Users user);
    List<UserDto> userListToUserDtoList(List<Users> users);
}