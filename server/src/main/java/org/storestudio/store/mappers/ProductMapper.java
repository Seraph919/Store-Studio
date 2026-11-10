package org.storestudio.store.mappers;

import org.storestudio.store.entities.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.storestudio.store.dtos.ProductDto;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "sellerId", source = "user.id")
    ProductDto productToProductDto(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "feedbacks", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product productDtoToProduct(ProductDto product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "feedbacks", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "images", ignore = true)
    void update(ProductDto productDto, @MappingTarget Product product);

    List<ProductDto> productsToProductDtos(List<Product> products);
}
