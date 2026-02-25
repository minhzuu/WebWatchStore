package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.CartItem;
import iuh.fit.se.backend.service.CartItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
@RequiredArgsConstructor
public class CartItemController {
    private final CartItemService cartItemService;

    @GetMapping
    public List<CartItem> getAll() {
        return cartItemService.getAll();
    }

    @GetMapping("/{id}")
    public CartItem getOne(@PathVariable Long id) {
        return cartItemService.get(id);
    }

    @PostMapping
    public CartItem create(@RequestBody CartItem item) {
        return cartItemService.save(item);
    }

    @PutMapping("/{id}")
    public CartItem update(@PathVariable Long id, @RequestBody CartItem item) {
        item.setId(id);
        return cartItemService.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cartItemService.delete(id);
    }
}
