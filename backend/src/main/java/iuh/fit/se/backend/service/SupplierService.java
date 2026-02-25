package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Supplier;
import iuh.fit.se.backend.entity.enums.Status;
import iuh.fit.se.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplier(Long id) {
        return supplierRepository.findById(id).orElse(null);
    }

    public Supplier saveSupplier(Supplier supplier) {
        // Set default status if null (for new suppliers)
        if (supplier.getStatus() == null) {
            supplier.setStatus(Status.ACTIVE);
        }
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElse(null);
        supplier.setStatus(Status.INACTIVE);
        supplierRepository.save(supplier);
    }
}
