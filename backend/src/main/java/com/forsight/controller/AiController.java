package com.forsight.controller;

import com.forsight.model.Resource;
import com.forsight.repository.ResourceRepository;
import com.forsight.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private ResourceRepository resourceRepository;

    public static class NotesRequest {
        private Long resourceId;

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    }

    public static class ChatRequest {
        private Long resourceId;
        private String message;
        private String historyJson;

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getHistoryJson() { return historyJson; }
        public void setHistoryJson(String historyJson) { this.historyJson = historyJson; }
    }

    @PostMapping("/notes")
    public ResponseEntity<?> getSmartNotes(@RequestBody NotesRequest request) {
        try {
            Resource resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            String notes = aiService.generateNotes(resource);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> askAiAssistant(@RequestBody ChatRequest request) {
        try {
            Resource resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            String response = aiService.chatAboutResource(resource, request.getMessage(), request.getHistoryJson());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
