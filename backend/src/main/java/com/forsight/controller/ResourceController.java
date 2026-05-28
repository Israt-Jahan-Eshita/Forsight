package com.forsight.controller;

import com.forsight.model.Resource;
import com.forsight.model.User;
import com.forsight.repository.ResourceRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("className") String className,
            @RequestParam("subject") String subject) {

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            Resource resource = Resource.builder()
                    .title(title)
                    .description(description)
                    .className(className)
                    .subject(subject)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileData(file.getBytes())
                    .teacher(teacher)
                    .uploadDate(LocalDateTime.now())
                    .build();

            Resource savedResource = resourceRepository.save(resource);
            
            // Return resource without binary data to keep response lightweight
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Resource.builder()
                            .id(savedResource.getId())
                            .title(savedResource.getTitle())
                            .description(savedResource.getDescription())
                            .className(savedResource.getClassName())
                            .subject(savedResource.getSubject())
                            .fileName(savedResource.getFileName())
                            .fileType(savedResource.getFileType())
                            .teacher(savedResource.getTeacher())
                            .uploadDate(savedResource.getUploadDate())
                            .build()
            );

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to read file data");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getResources(
            @RequestParam(value = "className", required = false) String className,
            @RequestParam(value = "subject", required = false) String subject) {

        List<Resource> resources;
        if (className != null && !className.trim().isEmpty() && subject != null && !subject.trim().isEmpty()) {
            resources = resourceRepository.findByClassNameAndSubject(className, subject);
        } else if (className != null && !className.trim().isEmpty()) {
            resources = resourceRepository.findByClassName(className);
        } else {
            resources = resourceRepository.findAll();
        }

        // Clean fileData to minimize payload size during listing
        resources.forEach(r -> r.setFileData(null));
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadResource(@PathVariable("id") Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getFileData() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resource.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFileName() + "\"")
                .body(resource.getFileData());
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getClasses() {
        return ResponseEntity.ok(resourceRepository.findDistinctClassNames());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects(@RequestParam("className") String className) {
        return ResponseEntity.ok(resourceRepository.findDistinctSubjectsByClassName(className));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable("id") Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Allow deletion if current user is the uploading teacher or admin
        if (currentUser.getRole().name().equals("ADMIN") || resource.getTeacher().getId().equals(currentUser.getId())) {
            resourceRepository.delete(resource);
            return ResponseEntity.ok("Resource deleted successfully");
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to delete resource");
    }
}
