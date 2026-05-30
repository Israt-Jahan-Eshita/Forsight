package com.forsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "docs_config")
public class DocsConfig {

    @Id
    private Long id = 1L; // Singleton entity

    private boolean isPublic;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;

    @Column(columnDefinition = "TEXT")
    private String contentJson; // Stores pitch deck, team, etc.

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }

    public LocalDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDateTime availableUntil) { this.availableUntil = availableUntil; }

    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }
}
