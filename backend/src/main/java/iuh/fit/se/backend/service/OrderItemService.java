package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.OrderItem;
import iuh.fit.se.backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemService {
    private final OrderItemRepository orderItemRepository;

    public List<OrderItem> getAll() { return orderItemRepository.findAll(); }
    public OrderItem get(Long id) { return orderItemRepository.findById(id).orElse(null); }
    public OrderItem save(OrderItem item) { return orderItemRepository.save(item); }
    public void delete(Long id) { orderItemRepository.deleteById(id); }
}
