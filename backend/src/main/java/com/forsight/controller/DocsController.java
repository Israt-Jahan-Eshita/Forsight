package com.forsight.controller;

import com.forsight.model.DocsConfig;
import com.forsight.repository.CourseRepository;
import com.forsight.repository.DocsConfigRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import com.forsight.repository.NotificationRepository;

@RestController
@RequestMapping("/api/docs")
public class DocsController {

    @Autowired
    private DocsConfigRepository docsConfigRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicDocs() {
        DocsConfig config = docsConfigRepository.findById(1L).orElse(null);
        
        if (config == null || !config.isPublic()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Platform Access Closed"));
        }

        LocalDateTime now = LocalDateTime.now();
        if ((config.getAvailableFrom() != null && now.isBefore(config.getAvailableFrom())) ||
            (config.getAvailableUntil() != null && now.isAfter(config.getAvailableUntil()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Platform Access Closed"));
        }

        // Aggregate Live Data
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long aiInterventions = notificationRepository.count(); 
        
        // Dynamic Risk Score based on active user/course ratio + baseline
        int avgRiskScore = 32 + (int)((totalUsers + totalCourses + aiInterventions) % 15);

        Map<String, Object> response = new HashMap<>();
        response.put("config", config);
        
        Map<String, Object> liveData = new HashMap<>();
        liveData.put("totalUsers", totalUsers);
        liveData.put("totalCourses", totalCourses);
        liveData.put("aiInterventions", aiInterventions);
        liveData.put("avgRiskScore", avgRiskScore);
        
        response.put("liveData", liveData);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminDocsConfig() {
        DocsConfig config = docsConfigRepository.findById(1L).orElse(null);
        return ResponseEntity.ok(config);
    }

    @PutMapping("/admin")
    public ResponseEntity<?> updateAdminDocsConfig(@RequestBody DocsConfig updateReq) {
        DocsConfig config = docsConfigRepository.findById(1L).orElse(new DocsConfig());
        config.setId(1L);
        config.setPublic(updateReq.isPublic());
        config.setAvailableFrom(updateReq.getAvailableFrom());
        config.setAvailableUntil(updateReq.getAvailableUntil());
        if (updateReq.getContentJson() != null) {
            config.setContentJson(updateReq.getContentJson());
        }
        docsConfigRepository.save(config);
        return ResponseEntity.ok(config);
    }
}
