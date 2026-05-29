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

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "reaction")
    private String reaction;

    @Column(name = "reply_to_id")
    private Long replyToId;

    // Constructors
    public Message() {}

    public Message(Long id, User sender, User receiver, String content, LocalDateTime timestamp, Boolean isRead, String reaction, Long replyToId) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.reaction = reaction;
        this.replyToId = replyToId;
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

    public Boolean isRead() {
        return isRead;
    }

    public void setRead(Boolean read) {
        isRead = read;
    }

    public String getReaction() { return reaction; }
    public void setReaction(String reaction) { this.reaction = reaction; }

    public Long getReplyToId() { return replyToId; }
    public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }

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
        private boolean isRead = false;
        private String reaction;
        private Long replyToId;

        public MessageBuilder id(Long id) { this.id = id; return this; }
        public MessageBuilder sender(User sender) { this.sender = sender; return this; }
        public MessageBuilder receiver(User receiver) { this.receiver = receiver; return this; }
        public MessageBuilder content(String content) { this.content = content; return this; }
        public MessageBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public MessageBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public MessageBuilder reaction(String reaction) { this.reaction = reaction; return this; }
        public MessageBuilder replyToId(Long replyToId) { this.replyToId = replyToId; return this; }

        public Message build() {
            return new Message(id, sender, receiver, content, timestamp, isRead, reaction, replyToId);
        }
    }
}
