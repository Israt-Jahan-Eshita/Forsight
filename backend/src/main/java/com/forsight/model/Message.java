package com.forsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Constructors
    public Message() {}

    public Message(Long id, User sender, User receiver, String content, LocalDateTime timestamp) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // Builder
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public static class MessageBuilder {
        private Long id;
        private User sender;
        private User receiver;
        private String content;
        private LocalDateTime timestamp;

        public MessageBuilder id(Long id) { this.id = id; return this; }
        public MessageBuilder sender(User sender) { this.sender = sender; return this; }
        public MessageBuilder receiver(User receiver) { this.receiver = receiver; return this; }
        public MessageBuilder content(String content) { this.content = content; return this; }
        public MessageBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public Message build() {
            return new Message(id, sender, receiver, content, timestamp);
        }
    }
}
