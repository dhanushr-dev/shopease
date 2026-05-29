package com.easeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String subtitle;
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String buttonText;
    private String buttonLink;
    private Boolean active;
}
