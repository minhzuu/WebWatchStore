package iuh.fit.se.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary
     * @param file MultipartFile from request
     * @param folder Folder name in Cloudinary (e.g., "products", "banners")
     * @return Map containing url, public_id, and other metadata
     */
    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );
            
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            log.info("Uploaded image to Cloudinary: {} ({})", uploadResult.get("public_id"), uploadResult.get("url"));
            return uploadResult;
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Delete image from Cloudinary
     * @param publicId Public ID of the image (e.g., "products/product-123456")
     * @return Map containing result status
     */
    public Map<String, Object> deleteImage(String publicId) throws IOException {
        try {
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("🗑️ Deleted image from Cloudinary: {} (result: {})", publicId, deleteResult.get("result"));
            return deleteResult;
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     * @param url Full Cloudinary URL
     * @return Public ID (e.g., "products/product-123456")
     */
    public String extractPublicId(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<format>
            String[] parts = url.split("/upload/");
            if (parts.length < 2) return null;
            
            String afterUpload = parts[1];
            // Remove version (v1234567890/)
            if (afterUpload.matches("v\\d+/.*")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
            }
            
            // Remove file extension
            int lastDot = afterUpload.lastIndexOf(".");
            if (lastDot > 0) {
                afterUpload = afterUpload.substring(0, lastDot);
            }
            
            return afterUpload;
        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", url);
            return null;
        }
    }
}
