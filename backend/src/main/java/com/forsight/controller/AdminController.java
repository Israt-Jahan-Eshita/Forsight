package com.forsight.controller;

import com.forsight.model.Role;
import com.forsight.model.User;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/system-stats")
    public ResponseEntity<?> getSystemStats() {
        try {
            List<User> teachers = userRepository.findByRole(Role.TEACHER);
            List<User> students = userRepository.findByRole(Role.STUDENT);

            return ResponseEntity.ok(Map.of(
                    "totalTeachers", teachers.size(),
                    "totalStudents", students.size(),
                    "activeToday", 890, // Stubbed metric
                    "criticalAlerts", 12 // Stubbed metric
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> teachers = userRepository.findByRole(Role.TEACHER);
            List<User> students = userRepository.findByRole(Role.STUDENT);

            List<Map<String, Object>> formattedTeachers = teachers.stream().map(t -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", t.getId());
                map.put("name", t.getName());
                map.put("email", t.getEmail());
                map.put("dept", t.getSubject() != null ? t.getSubject() : "Unassigned");
                map.put("status", t.getStatus() != null ? t.getStatus() : "Active");
                return map;
            }).collect(Collectors.toList());

            List<Map<String, Object>> formattedStudents = students.stream().map(s -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", s.getId());
                map.put("name", s.getName());
                map.put("email", s.getEmail());
                map.put("info", s.getGrade() != null ? s.getGrade() : "Unassigned");
                map.put("status", s.getStatus() != null ? s.getStatus() : "Active");
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "teachers", formattedTeachers,
                    "students", formattedStudents
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
