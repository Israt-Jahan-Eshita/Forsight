package com.forsight.controller;

import com.forsight.model.Message;
import com.forsight.model.User;
import com.forsight.repository.MessageRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.forsight.repository.NotificationRepository notificationRepository;

    public static class MessageRequest {
        private Long receiverId;
        private String content;
        private Long replyToId;

        public Long getReceiverId() { return receiverId; }
        public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Long getReplyToId() { return replyToId; }
        public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User sender = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Sender not found"));

            User receiver = userRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));

            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .content(request.getContent())
                    .timestamp(LocalDateTime.now())
                    .replyToId(request.getReplyToId())
                    .isRead(false)
                    .build();

            Message savedMessage = messageRepository.save(message);

            // Create real dynamic notification for the receiver
            com.forsight.model.Notification notification = com.forsight.model.Notification.builder()
                    .user(receiver)
                    .title("New Message")
                    .message("You have a new message from " + sender.getName())
                    .type("info")
                    .link("/messages")
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getChatHistory(@PathVariable("userId") Long userId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            User targetUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Target user not found"));

            List<Message> history = messageRepository.findChatHistory(currentUser, targetUser);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            List<User> contacts = messageRepository.findActiveContacts(currentUser);
            // Hide passwords for safety
            contacts.forEach(c -> c.setPassword(null));
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            List<User> allUsers = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());

            // Hide passwords for safety
            allUsers.forEach(u -> u.setPassword(null));
            return ResponseEntity.ok(allUsers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
