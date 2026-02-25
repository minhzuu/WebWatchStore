package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Inventory;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public List<Inventory> getAll() { return inventoryRepository.findAll(); }
    public Inventory get(Long id) { return inventoryRepository.findById(id).orElse(null); }
    public Inventory getByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("No inventory found for product id " + productId));
    }
    public Inventory save(Inventory inventory) { return inventoryRepository.save(inventory); }
    public void delete(Long id) { inventoryRepository.deleteById(id); }
    
    public Inventory updateStock(Long inventoryId, Integer newStock, User admin, String reason) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        int oldStock = inventory.getStock();
        inventory.setStock(newStock);
        inventory.setUpdatedBy(admin);
        
        Inventory saved = inventoryRepository.save(inventory);
        
        log.info("📝 Admin '{}' cập nhật số lượng tồn kho #{}: {} → {} (Lý do: {})",
                admin.getUsername(), inventoryId, oldStock, newStock, reason != null ? reason : "Không ghi");
        
        return saved;
    }
}
