package iuh.fit.se.backend.dto.request;

import iuh.fit.se.backend.entity.enums.BannerLinkType;
import iuh.fit.se.backend.entity.enums.BannerPosition;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BannerRequest {
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String description;
    private Integer displayOrder;
    private Boolean active;
    
    // New fields
    private BannerLinkType linkType;
    private Long linkId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BannerPosition position;
}
