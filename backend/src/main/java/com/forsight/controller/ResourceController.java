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

    @Autowired
    private com.forsight.repository.CourseRepository courseRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("courseId") Long courseId) {

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            com.forsight.model.Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            Resource resource = Resource.builder()
                    .title(title)
                    .description(description)
                    .course(course)
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
                            .course(savedResource.getCourse())
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
            @RequestParam(value = "courseId", required = false) Long courseId) {

        List<Resource> resources;
        if (courseId != null) {
            resources = resourceRepository.findByCourse_Id(courseId);
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

    @GetMapping("/{id}/view")
    public ResponseEntity<byte[]> viewResource(@PathVariable("id") Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getFileData() == null) {
            String placeholderHtml = "<html><body style='display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:#666;background:#f9f9f9;text-align:center;'><div><h3>" + resource.getFileName() + "</h3><p>Media playback is simulated for this hackathon demo.<br/>(Use the 'AI Assistant & Notes' button to interact with the transcript!)</p></div></body></html>";
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(placeholderHtml.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resource.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFileName() + "\"")
                .body(resource.getFileData());
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
