package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.response.CartItemDto;
import iuh.fit.se.backend.dto.response.CartResponse;
import iuh.fit.se.backend.entity.Cart;
import iuh.fit.se.backend.entity.CartItem;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.CartItemRepository;
import iuh.fit.se.backend.repository.CartRepository;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public CartResponse getUserCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found")));
                    return cartRepository.save(newCart);
                });

        // Sort by updatedAt descending - most recently updated items first
        List<CartItemDto> items = cart.getCartItems().stream()
                .sorted((a, b) -> {
                    if (a.getUpdatedAt() == null && b.getUpdatedAt() == null) return 0;
                    if (a.getUpdatedAt() == null) return 1;
                    if (b.getUpdatedAt() == null) return -1;
                    return b.getUpdatedAt().compareTo(a.getUpdatedAt());
                })
                .map(item -> {
                    Product product = item.getProduct();
                    String imageUrl = product.getPrimaryImageUrl();
                    // If primaryImageUrl is relative, prepend /images/products/
                    if (imageUrl != null && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
                        imageUrl = "/images/products/" + imageUrl;
                    }
                    
                    return new CartItemDto(
                            item.getId(),
                            product.getId(),
                            product.getName(),
                            imageUrl,
                            item.getQuantity(),
                            product.getCurrentPrice(),
                            product.getStockQuantity()
                    );
                }
        ).toList();

        BigDecimal total = items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), items, Double.parseDouble(total.toString()));
    }


    @Override
    public CartResponse addToCart(Long userId, Long productId, Integer quantity) {
        CartResponse response = getUserCart(userId);
        Cart cart = cartRepository.findByUserId(userId).get();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (cartItem == null) {
            cartItem = CartItem.builder()
                    .quantity(quantity)
                    .cart(cart)
                    .product(product)
                    .build();
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }

        cartItemRepository.save(cartItem);
        return getUserCart(userId);
    }

    @Override
    public CartResponse updateQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow();

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return getUserCart(item.getCart().getUser().getId());
    }

    @Override
    public CartResponse removeItem(Long cartItemId) {
        // Check if item exists
        var itemOpt = cartItemRepository.findById(cartItemId);
        if (itemOpt.isEmpty()) {
            // Item already removed or doesn't exist - return empty response
            // This is idempotent - calling delete on non-existent item is safe
            return new CartResponse(null, new ArrayList<>(), 0.0);
        }
        
        CartItem item = itemOpt.get();
        Long userId = item.getCart().getUser().getId();
        cartItemRepository.delete(item);
        return getUserCart(userId);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            int itemCount = cart.getCartItems().size();
            cart.getCartItems().clear();
            cartRepository.save(cart);
            log.info("🗑️ Cleared {} items from cart for user #{}", itemCount, userId);
        }
    }
    
    @Override
    @Transactional
    public void removeProductsFromCart(Long userId, List<Long> productIds) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            List<CartItem> itemsToRemove = cart.getCartItems().stream()
                    .filter(item -> productIds.contains(item.getProduct().getId()))
                    .toList();
            
            cart.getCartItems().removeAll(itemsToRemove);
            cartRepository.save(cart);
            log.info("🗑️ Removed {} products from cart for user #{}", itemsToRemove.size(), userId);
        }
    }
}
