package com.forsight.controller;

import com.forsight.model.Course;
import com.forsight.model.User;
import com.forsight.repository.CourseRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<Course>> getCoursesForTeacher(Authentication authentication) {
        User teacher = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return ResponseEntity.ok(courseRepository.findByTeacher(teacher));
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getClasses() {
        return ResponseEntity.ok(courseRepository.findDistinctClassNames());
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course courseRequest, Authentication authentication) {
        User teacher = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getRole() != com.forsight.model.Role.TEACHER) {
            return ResponseEntity.status(403).build();
        }

        courseRequest.setTeacher(teacher);
        Course savedCourse = courseRepository.save(courseRequest);
        return ResponseEntity.ok(savedCourse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, Authentication authentication) {
        User teacher = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            return ResponseEntity.status(403).build();
        }

        courseRepository.delete(course);
        return ResponseEntity.ok().build();
    }
}
