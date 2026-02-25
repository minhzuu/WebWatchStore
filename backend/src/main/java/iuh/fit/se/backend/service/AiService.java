package iuh.fit.se.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.se.backend.entity.Brand;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.repository.BrandRepository;
import iuh.fit.se.backend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AiService.class);
    private static final MediaType JSON_MEDIA_TYPE = MediaType.parse("application/json; charset=utf-8");
    private static final int CONTEXT_LIMIT = 8;

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;

    @Value("${groq.api.key:${GROQ_API_KEY:}}")
    private String groqApiKey;

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String groqBaseUrl;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${groq.api.temperature:0.4}")
    private double groqTemperature;

    @Value("${groq.api.max-output-tokens:1024}")
    private int groqMaxTokens;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiService(ProductRepository productRepository, BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
    }

    public String queryAi(String message) {
        String apiKey = resolveGroqApiKey();
        if (!StringUtils.hasText(apiKey)) {
            throw new RuntimeException("Groq API key is not configured. Please set GROQ_API_KEY environment variable or `groq.api.key` property.");
        }

        String sanitizedMessage = message != null ? message.trim() : "";
        List<Product> contextProducts = findRelevantProducts(sanitizedMessage);
        Map<String, Object> payload = buildGroqPayload(sanitizedMessage, contextProducts);
        try {
            String payloadJson = objectMapper.writeValueAsString(payload);
            Request request = new Request.Builder()
                    .url(buildGroqEndpoint())
                    .addHeader("Authorization", "Bearer " + apiKey.trim())
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(payloadJson, JSON_MEDIA_TYPE))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";
                if (!response.isSuccessful()) {
                    LOGGER.error("Groq API error: status={} body={}", response.code(), responseBody);
                    throw new RuntimeException(String.format("Groq API error (%d). %s", response.code(), responseBody));
                }
                Map<String, Object> result = objectMapper.readValue(responseBody, new TypeReference<Map<String, Object>>() {});
                String reply = extractGroqReply(result);
                if (!StringUtils.hasText(reply)) {
                    LOGGER.warn("Groq response empty, returning fallback answer.");
                    return fallbackAnswer(contextProducts);
                }
                return reply.trim();
            }
        } catch (IOException ex) {
            LOGGER.error("Failed to invoke Groq API", ex);
            if (!contextProducts.isEmpty()) {
                return fallbackAnswer(contextProducts);
            }
            throw new RuntimeException("Failed to invoke Groq API", ex);
        }
    }

    @PostConstruct
    public void init() {
        String apiKey = resolveGroqApiKey();
        if (!StringUtils.hasText(apiKey)) {
            LOGGER.warn("Groq API key is not configured. Set GROQ_API_KEY environment variable or groq.api.key property to enable AI endpoint.");
        } else {
            LOGGER.info("Groq API key configured. AI endpoint is enabled.");
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Groq API key present={} prefix={} length={}", StringUtils.hasText(apiKey), maskKeyPrefix(apiKey), apiKey != null ? apiKey.length() : 0);
            LOGGER.debug("Groq base URL={} model={}", groqBaseUrl, groqModel);
        }
    }

    private List<Product> findRelevantProducts(String message) {
        if (!StringUtils.hasText(message)) {
            return List.of();
        }

        String normalizedMessage = normalize(message);
        List<Product> collected = new ArrayList<>();
        Set<Long> seenProductIds = new LinkedHashSet<>();

        for (Brand brand : brandRepository.findAll()) {
            if (!StringUtils.hasText(brand.getName())) {
                continue;
            }
            if (normalizedMessage.contains(normalize(brand.getName()))) {
                addUniqueProducts(collected, seenProductIds,
                        productRepository.findTop8ByBrand_IdOrderByCreatedAtDesc(brand.getId()));
            }
        }

        if (collected.isEmpty()) {
            for (String keyword : extractKeywords(message)) {
                addUniqueProducts(collected, seenProductIds, productRepository.findByNameContainingIgnoreCase(keyword));
                if (collected.size() >= CONTEXT_LIMIT) {
                    break;
                }
            }
        }

        if (collected.isEmpty()) {
            Pageable pageable = PageRequest.of(0, CONTEXT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
            addUniqueProducts(collected, seenProductIds, productRepository.findAll(pageable).getContent());
        }

        return collected.size() > CONTEXT_LIMIT ? collected.subList(0, CONTEXT_LIMIT) : collected;
    }

    private void addUniqueProducts(List<Product> target, Set<Long> seenProductIds, List<Product> candidates) {
        if (candidates == null) {
            return;
        }
        for (Product product : candidates) {
            if (product == null || product.getId() == null || seenProductIds.contains(product.getId())) {
                continue;
            }
            target.add(product);
            seenProductIds.add(product.getId());
            if (target.size() >= CONTEXT_LIMIT) {
                break;
            }
        }
    }

    private List<String> extractKeywords(String message) {
        if (!StringUtils.hasText(message)) {
            return List.of();
        }
        return Arrays.stream(message.toLowerCase().split("\\W+"))
            .filter(token -> token.length() >= 4)
            .limit(4)
            .collect(Collectors.toList());
    }

    private Map<String, Object> buildGroqPayload(String userMessage, List<Product> contextProducts) {
        return Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", buildSystemPrompt()
                        ),
                        Map.of(
                                "role", "user",
                                "content", buildUserPrompt(userMessage, contextProducts)
                        )
                ),
                "temperature", groqTemperature,
                "max_tokens", groqMaxTokens
        );
    }

    private String buildSystemPrompt() {
        return "Bạn là trợ lý bán đồng hồ của cửa hàng Watch Store. " +
                "Luôn trả lời bằng tiếng Việt một cách tự nhiên, chỉ dựa trên dữ liệu sản phẩm được cung cấp. " +
                "Không được tạo hoặc suy đoán mã, ID hay đường dẫn nội bộ của sản phẩm. " +
                "Nêu bật thương hiệu, giá bán, điểm nổi bật và gợi ý lý do phù hợp với nhu cầu của khách. " +
                "Nếu thiếu dữ liệu, hãy nói rõ và đề xuất người dùng cung cấp thêm yêu cầu.";
    }

    private String buildUserPrompt(String userMessage, List<Product> contextProducts) {
        StringBuilder builder = new StringBuilder();
        builder.append("Người dùng hỏi: ").append(userMessage).append("\n\n");
        if (contextProducts.isEmpty()) {
            builder.append("Không tìm thấy dữ liệu sản phẩm phù hợp trong cơ sở dữ liệu. Hãy xin lỗi và đề nghị người dùng cung cấp thương hiệu hoặc tiêu chí cụ thể hơn.");
            return builder.toString();
        }
        builder.append("Thông tin sản phẩm lấy từ cơ sở dữ liệu (không bao gồm ID):\n");
        int index = 1;
        for (Product product : contextProducts) {
            builder.append(index++).append(". ")
                    .append(formatProductLine(product))
                    .append("\n");
        }
        builder.append("\nHãy tổng hợp và tư vấn dựa trên danh sách trên, không thêm sản phẩm mới ngoài dữ liệu đã cho.");
        return builder.toString();
    }

    private String formatProductLine(Product product) {
        String brandName = product.getBrand() != null ? product.getBrand().getName() : "Thương hiệu chưa rõ";
        String price = formatCurrency(product.getCurrentPrice());
        Integer stock = product.getStockQuantity();
        String imageUrl = product.getPrimaryImageUrl();
        String desc = truncate(product.getDescription(), 220);
        return String.format("%s - %s | Giá: %s | Tồn kho: %s | Nổi bật: %s%s",
                brandName,
                product.getName(),
                price,
                stock != null ? stock : 0,
                desc,
                StringUtils.hasText(imageUrl) ? " | Ảnh: " + imageUrl : "");
    }

    private String truncate(String value, int maxLength) {
        if (!StringUtils.hasText(value) || value.length() <= maxLength) {
            return value != null ? value : "";
        }
        return value.substring(0, maxLength).trim() + "...";
    }

    private String formatCurrency(BigDecimal price) {
        if (price == null) {
            return "Chưa cập nhật";
        }
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(price);
    }

    private String fallbackAnswer(List<Product> products) {
        if (products.isEmpty()) {
            return "Xin lỗi, hiện chưa tìm thấy sản phẩm nào phù hợp với thương hiệu mà bạn quan tâm. Bạn có thể cung cấp thêm tên thương hiệu hoặc yêu cầu cụ thể hơn để mình hỗ trợ tốt hơn.";
        }
        StringBuilder builder = new StringBuilder("Mình tìm được một số mẫu đang có sẵn:");
        int idx = 1;
        for (Product product : products) {
            builder.append("\n").append(idx++).append(". ")
                    .append(formatProductLine(product));
        }
        builder.append("\nHãy cho mình biết bạn thích mẫu nào để mình tư vấn sâu hơn nhé!");
        return builder.toString();
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.toLowerCase();
    }

    private String resolveGroqApiKey() {
        return StringUtils.hasText(groqApiKey) ? groqApiKey : null;
    }

    private String buildGroqEndpoint() {
        String base = StringUtils.hasText(groqBaseUrl) ? groqBaseUrl : "https://api.groq.com/openai/v1";
        base = base.endsWith("/") ? base : base + "/";
        return base + "chat/completions";
    }

    private String extractGroqReply(Map<String, Object> result) {
        if (result == null) {
            return "";
        }
        Object choicesObj = result.get("choices");
        if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()) {
            return "";
        }
        Object firstChoice = choices.get(0);
        if (!(firstChoice instanceof Map<?, ?> choiceMap)) {
            return "";
        }
        Object messageObj = choiceMap.get("message");
        if (messageObj instanceof Map<?, ?> messageMap) {
            Object contentObj = messageMap.get("content");
            if (contentObj != null) {
                return contentObj.toString();
            }
        }
        Object textObj = choiceMap.get("text");
        return textObj != null ? textObj.toString() : "";
    }

    private String maskKeyPrefix(String key) {
        if (!StringUtils.hasText(key)) {
            return "";
        }
        int prefixLen = Math.min(6, key.length());
        return key.substring(0, prefixLen) + "***";
    }
}
