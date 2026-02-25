package iuh.fit.se.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "setting_general")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingGeneral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "site_name", length = 100)
    private String siteName;

    @Column(name = "logo", length = 512)
    private String logo;

    @Column(name = "slogan", length = 255)
    private String slogan;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "copyright", length = 255)
    private String copyright;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "hotline", length = 30)
    private String hotline;

    @Column(name = "payment_methods", columnDefinition = "TEXT")
    private String paymentMethods; // JSON string: [{"name": "VNPay", "imageUrl": "..."}]

    @Column(name = "social_media", columnDefinition = "TEXT")
    private String socialMedia; // JSON string: [{"name": "Facebook", "imageUrl": "...", "url": "..."}]

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
