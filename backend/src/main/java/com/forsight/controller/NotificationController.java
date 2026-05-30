package com.forsight.controller;

import com.forsight.model.Notification;
import com.forsight.model.User;
import com.forsight.repository.NotificationRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Notification> notifications = notificationRepository.findByUserOrderByTimestampDesc(user);
            
            // Convert to format expected by frontend
            List<Map<String, Object>> response = notifications.stream().map(n -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", n.getId());
                map.put("title", n.getTitle());
                map.put("message", n.getMessage());
                map.put("type", n.getType());
                map.put("link", n.getLink());
                map.put("timestamp", n.getTimestamp() != null ? n.getTimestamp().toString() : "");
                map.put("isRead", n.isRead());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
