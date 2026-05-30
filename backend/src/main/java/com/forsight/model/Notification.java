package com.forsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The recipient of the notification

    private String title;
    private String message;
    private String type; // e.g., "info", "warning", "success"
    private String link; // e.g., "/messages", "/submissions"
    private LocalDateTime timestamp;
    private boolean isRead;

    public Notification() {}

    public Notification(Long id, User user, String title, String message, String type, String link, LocalDateTime timestamp, boolean isRead) {
        this.id = id;
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.link = link;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private Long id;
        private User user;
        private String title;
        private String message;
        private String type;
        private String link;
        private LocalDateTime timestamp;
        private boolean isRead;

        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }
        public NotificationBuilder link(String link) { this.link = link; return this; }
        public NotificationBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public NotificationBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }

        public Notification build() {
            return new Notification(id, user, title, message, type, link, timestamp, isRead);
        }
    }
}
