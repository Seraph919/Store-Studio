package org.storestudio.store.exceptions;

import java.util.UUID;

public class CartNotFoundException extends RuntimeException {
    public CartNotFoundException(String message) {
        super(message);
    }

    public CartNotFoundException(UUID id) {
        super("Cart not found with id: " + id);
    }
}
