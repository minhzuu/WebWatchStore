package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.OrderRequest;
import iuh.fit.se.backend.dto.request.OrderStatusUpdateRequest;
import iuh.fit.se.backend.dto.response.OrderResponse;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate,
            @RequestParam(required = false) Double minTotal,
            @RequestParam(required = false) Double maxTotal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(orderService.getAdminOrders(
                customerName,
            username,
            userId,
                status,
                fromDate,
                toDate,
                minTotal,
                maxTotal,
                page,
                size,
                sortBy,
                sortDir
        ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Get current user from authentication using username
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is trying to access their own orders or is ADMIN
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        
        if (!isAdmin && !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền xem đơn hàng của người khác");
        }
        
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderResponse(id));
    }

    @GetMapping("/{id}")
    public Order getOne(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody OrderRequest request) {
        Order saved = orderService.saveOrder(request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(
            @PathVariable Long id,
            @RequestBody OrderRequest request
    ) {
        Order saved = orderService.updateOrder(id, request);
        return ResponseEntity.ok(saved);
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody @Validated OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Check if user is authenticated
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Vui lòng đăng nhập để hủy đơn hàng");
            }
            
            // Get current user from authentication
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get the order
            Order order = orderService.getOrder(id);
            
            // Check if user owns this order or is ADMIN
            boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
            if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("Bạn không có quyền hủy đơn hàng này");
            }
            
            // Check if order is in PENDING status
            if (!order.getStatus().equals(OrderStatus.PENDING)) {
                return ResponseEntity.badRequest().body("Chỉ có thể hủy đơn hàng đang chờ xử lý");
            }
            
            // Cancel the order
            OrderResponse response = orderService.updateOrderStatus(id, OrderStatus.CANCELLED);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error cancelling order: ", e);
            return ResponseEntity.badRequest().body("Không thể hủy đơn hàng: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Order>> searchOrders(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate,
            @RequestParam(required = false) Double minTotal,
            @RequestParam(required = false) Double maxTotal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(orderService.searchOrders(
                customerName, username, userId, status, fromDate, toDate, minTotal, maxTotal, page, size, sortBy, sortDir
        ));
    }
}
