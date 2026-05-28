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
}
