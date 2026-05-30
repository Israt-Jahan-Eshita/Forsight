package com.forsight.controller;

import com.forsight.dto.AuthResponse;
import com.forsight.dto.LoginRequest;
import com.forsight.dto.RegisterRequest;
import com.forsight.model.Role;
import com.forsight.model.User;
import com.forsight.repository.UserRepository;
import com.forsight.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostConstruct
    public void initDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@school.edu")) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@school.edu")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.ADMIN)
                    .status("Active")
                    .build();
            userRepository.save(admin);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, null, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email address is already in use");
        }

        Role userRole;
        try {
            userRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role specified");
        }

        int randomNum = 1000 + new Random().nextInt(9000);
        String namePart = request.getName().trim().split("\\s+")[0];
        String rawPassword = "FS_" + (namePart.isEmpty() ? "User" : namePart) + "_" + randomNum + "!";

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(userRole)
                .status("Active")
                .subject(request.getSubject())
                .grade(request.getGrade())
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, rawPassword, savedUser));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            String avatarUrl = request.get("avatarUrl");

            if (avatarUrl != null && !avatarUrl.isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }

            if (oldPassword != null && !oldPassword.isEmpty() && newPassword != null && !newPassword.isEmpty()) {
                if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect old password");
                }
                user.setPassword(passwordEncoder.encode(newPassword));
            }

            userRepository.save(user);

            // Also return the updated user in response if needed
            return ResponseEntity.ok(java.util.Map.of("message", "Profile updated successfully", "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(@org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
            }

            // Ensure uploads directory exists
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }

            // Save file
            String filename = user.getId() + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
            java.nio.file.Path filePath = uploadDir.resolve(filename);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Update user
            String avatarUrl = "/uploads/" + filename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(java.util.Map.of("message", "Profile picture updated successfully", "avatarUrl", avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/profile/picture")
    public ResponseEntity<?> deleteProfilePicture() {
        try {
            String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            user.setAvatarUrl(null);
            userRepository.save(user);

            return ResponseEntity.ok(java.util.Map.of("message", "Profile picture removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
