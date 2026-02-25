package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/product-images")
    public ResponseEntity<?> uploadProductImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "products");
    }

    @PostMapping("/banner-images")
    public ResponseEntity<?> uploadBannerImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "banners");
    }

    @PostMapping("/post-images")
    public ResponseEntity<?> uploadPostImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "posts");
    }

    @PostMapping("/logo")
    public ResponseEntity<?> uploadLogo(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "settings/logos");
    }

    @PostMapping("/payment-methods")
    public ResponseEntity<?> uploadPaymentMethodImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "settings/payment-methods");
    }

    @PostMapping("/social-media")
    public ResponseEntity<?> uploadSocialMediaImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "settings/social-media");
    }

    @PostMapping("/brand-logos")
    public ResponseEntity<?> uploadBrandLogos(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, "brands");
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is required");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File must be smaller than 5MB");
            }

            // Upload to Cloudinary
            Map uploadResult = cloudinaryService.uploadImage(file, "avatars");
            String imageUrl = (String) uploadResult.get("url");

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("filename", uploadResult.get("public_id"));
            resp.put("url", imageUrl);
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload error: " + e.getMessage());
        }
    }

    private ResponseEntity<?> uploadImages(MultipartFile[] files, String folder) {
        try {
            List<String> fileNames = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }

                // Validate file type
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest().body("File phải là ảnh (PNG, JPG, JPEG)");
                }

                // Validate file size (max 5MB)
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("File không được vượt quá 5MB");
                }

                // Upload to Cloudinary
                Map uploadResult = cloudinaryService.uploadImage(file, folder);
                String imageUrl = (String) uploadResult.get("url");
                fileNames.add(imageUrl);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileNames", fileNames);
            response.put("message", "Upload thành công " + fileNames.size() + " file");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi khi upload file: " + e.getMessage());
        }
    }

    @DeleteMapping("/product-images")
    public ResponseEntity<?> deleteProductImage(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    @DeleteMapping("/banner-images")
    public ResponseEntity<?> deleteBannerImage(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    @DeleteMapping("/post-images")
    public ResponseEntity<?> deletePostImage(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    @DeleteMapping("/logo")
    public ResponseEntity<?> deleteLogo(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    @DeleteMapping("/payment-methods")
    public ResponseEntity<?> deletePaymentMethodImage(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    @DeleteMapping("/social-media")
    public ResponseEntity<?> deleteSocialMediaImage(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    @DeleteMapping("/brand-logos")
    public ResponseEntity<?> deleteBrandLogo(@RequestBody Map<String, String> request) {
        return deleteImage(request.get("url"));
    }

    private ResponseEntity<?> deleteImage(String imageUrl) {
        try {
            String publicId = cloudinaryService.extractPublicId(imageUrl);
            cloudinaryService.deleteImage(publicId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa file thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi khi xóa file: " + e.getMessage());
        }
    }
}
