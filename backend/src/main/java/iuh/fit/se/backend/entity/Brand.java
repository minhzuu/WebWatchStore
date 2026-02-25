package iuh.fit.se.backend.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import iuh.fit.se.backend.entity.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    private String description;

    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    @Builder.Default
    private Status status = Status.ACTIVE;

    @OneToMany(mappedBy = "brand")
    @JsonManagedReference(value = "brand-products")
    @JsonIgnore // Ignore products khi serialize để tránh circular reference và giảm payload
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "brand")
    @JsonIgnore
    private List<Banner> banners = new ArrayList<>();
}

