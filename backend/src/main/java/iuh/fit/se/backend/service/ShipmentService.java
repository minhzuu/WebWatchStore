package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Shipment;
import iuh.fit.se.backend.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;

    public List<Shipment> getAll() { return shipmentRepository.findAll(); }
    public Shipment get(Long id) { return shipmentRepository.findById(id).orElse(null); }
    public Shipment save(Shipment shipment) { return shipmentRepository.save(shipment); }
    public void delete(Long id) { shipmentRepository.deleteById(id); }
}