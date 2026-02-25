package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.response.CartResponse;
public interface CartService {
    CartResponse getUserCart(Long userId);

    CartResponse addToCart(Long userId, Long productId, Integer quantity);

    CartResponse updateQuantity(Long cartItemId, Integer quantity);

    CartResponse removeItem(Long cartItemId);

    void clearCart(Long userId);
    
    void removeProductsFromCart(Long userId, java.util.List<Long> productIds);
}
