package iuh.fit.se.backend.dto.request;

import iuh.fit.se.backend.entity.enums.PostStatus;
import lombok.Data;

@Data
public class PostRequest {
    private String title;
    private String slug;
    private String content;
    private String summary;
    private String coverImageUrl;
    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
    private PostStatus status;
    private Long categoryId;
    private String tags;
}
