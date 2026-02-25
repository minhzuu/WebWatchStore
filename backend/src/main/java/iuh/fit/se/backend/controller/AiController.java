package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.request.AiQueryRequest;
import iuh.fit.se.backend.dto.response.AiQueryResponse;
import iuh.fit.se.backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiQueryResponse>> chat(@RequestBody AiQueryRequest request) {
        try {
            if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
                return ResponseEntity.ok(ApiResponse.failure("Message is required"));
            }
            String reply = aiService.queryAi(request.getMessage().trim());
            return ResponseEntity.ok(ApiResponse.success(new AiQueryResponse(reply)));
        } catch (RuntimeException ex) {
            return ResponseEntity.ok(ApiResponse.failure(ex.getMessage()));
        }
    }
}
