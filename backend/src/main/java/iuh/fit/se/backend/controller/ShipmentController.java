package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Shipment;
import iuh.fit.se.backend.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {
    private final ShipmentService shipmentService;

    @GetMapping
    public List<Shipment> getAll() {
        return shipmentService.getAll();
    }

    @GetMapping("/{id}")
    public Shipment getOne(@PathVariable Long id) {
        return shipmentService.get(id);
    }

    @PostMapping
    public Shipment create(@RequestBody Shipment shipment) {
        return shipmentService.save(shipment);
    }

    @PutMapping("/{id}")
    public Shipment update(@PathVariable Long id, @RequestBody Shipment shipment) {
        shipment.setId(id);
        return shipmentService.save(shipment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        shipmentService.delete(id);
    }
}
