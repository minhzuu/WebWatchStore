package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.CartItem;
import iuh.fit.se.backend.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemService {
    private final CartItemRepository cartItemRepository;

    public List<CartItem> getAll() { return cartItemRepository.findAll(); }
    public CartItem get(Long id) { return cartItemRepository.findById(id).orElse(null); }
    public CartItem save(CartItem item) { return cartItemRepository.save(item); }
    public void delete(Long id) { cartItemRepository.deleteById(id); }
}
