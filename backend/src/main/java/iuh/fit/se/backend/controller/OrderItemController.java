package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.OrderItem;
import iuh.fit.se.backend.service.OrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {
    private final OrderItemService orderItemService;

    @GetMapping
    public List<OrderItem> getAll() {
        return orderItemService.getAll();
    }

    @GetMapping("/{id}")
    public OrderItem getOne(@PathVariable Long id) {
        return orderItemService.get(id);
    }

    @PostMapping
    public OrderItem create(@RequestBody OrderItem item) {
        return orderItemService.save(item);
    }

    @PutMapping("/{id}")
    public OrderItem update(@PathVariable Long id, @RequestBody OrderItem item) {
        item.setId(id);
        return orderItemService.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderItemService.delete(id);
    }
}
