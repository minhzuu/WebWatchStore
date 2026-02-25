package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Supplier;
import iuh.fit.se.backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @GetMapping
    public List<Supplier> getAll() {
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/{id}")
    public Supplier getOne(@PathVariable Long id) {
        return supplierService.getSupplier(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Supplier create(@RequestBody Supplier supplier) {
        return supplierService.saveSupplier(supplier);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Supplier update(@PathVariable Long id, @RequestBody Supplier supplier) {
        Supplier existingSupplier = supplierService.getSupplier(id);
        if (existingSupplier == null) {
            throw new RuntimeException("Supplier not found with id: " + id);
        }
        
        // Update only non-null fields
        if (supplier.getName() != null) existingSupplier.setName(supplier.getName());
        if (supplier.getContact() != null) existingSupplier.setContact(supplier.getContact());
        if (supplier.getAddress() != null) existingSupplier.setAddress(supplier.getAddress());
        if (supplier.getStatus() != null) existingSupplier.setStatus(supplier.getStatus());
        
        return supplierService.saveSupplier(existingSupplier);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
    }
}
