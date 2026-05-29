package com.forsight.controller;

import com.forsight.model.Enrollment;
import com.forsight.model.Resource;
import com.forsight.model.User;
import com.forsight.repository.EnrollmentRepository;
import com.forsight.repository.ResourceRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.forsight.repository.CourseRepository courseRepository;

    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollInCourse(@PathVariable("courseId") Long courseId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            com.forsight.model.Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Already enrolled in this course"));
            }

            Enrollment enrollment = new Enrollment(student, course.getTeacher(), course, "Enrolled", LocalDateTime.now());
            Enrollment saved = enrollmentRepository.save(enrollment);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Autowired
    private com.forsight.repository.QuizSubmissionRepository quizSubmissionRepository;

    @GetMapping("/student")
    public ResponseEntity<?> getStudentEnrollments() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/student/chronicle")
    public ResponseEntity<?> getStudentChronicles() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            List<com.forsight.model.QuizSubmission> submissions = quizSubmissionRepository.findByStudent(student);

            List<com.forsight.dto.ChronicleDTO> chronicles = new java.util.ArrayList<>();
            for (Enrollment e : enrollments) {
                com.forsight.model.QuizSubmission latestSub = submissions.stream()
                        .filter(s -> {
                            if (s.getQuiz().getResource() != null) {
                                return s.getQuiz().getResource().getCourse().getId().equals(e.getCourse().getId());
                            } else {
                                return s.getQuiz().getClassName() != null && s.getQuiz().getClassName().equalsIgnoreCase(e.getCourse().getClassName())
                                    && s.getQuiz().getSubject() != null && s.getQuiz().getSubject().equalsIgnoreCase(e.getCourse().getName());
                            }
                        })
                        .max(java.util.Comparator.comparing(com.forsight.model.QuizSubmission::getId))
                        .orElse(null);

                String status = latestSub != null ? (latestSub.getStatus().equals("GRADED") ? "Completed" : "Pending") : "Enrolled";
                String feedback = latestSub != null && latestSub.getFeedback() != null ? latestSub.getFeedback() : "No feedback yet";
                String resourceName = latestSub != null && latestSub.getQuiz().getResource() != null ? latestSub.getQuiz().getResource().getTitle() : "Course Overview";
                String quizTitle = latestSub != null ? latestSub.getQuiz().getTitle() : "No active assignments";

                chronicles.add(new com.forsight.dto.ChronicleDTO(
                        e.getCourse().getId(),
                        e.getCourse().getName(),
                        e.getCourse().getClassName(),
                        status,
                        feedback,
                        latestSub != null ? latestSub.getEvaluationDate() : e.getEnrollmentDate(),
                        student.getId(),
                        student.getName(),
                        student.getEmail(),
                        e.getCourse().getTeacher().getId(),
                        e.getCourse().getTeacher().getName(),
                        resourceName,
                        quizTitle
                ));
            }

            return ResponseEntity.ok(chronicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherEnrollments() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByTeacherId(teacher.getId());
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/teacher/chronicle")
    public ResponseEntity<?> getTeacherChronicles() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByTeacherId(teacher.getId());
            List<com.forsight.model.QuizSubmission> submissions = quizSubmissionRepository.findByQuizTeacher(teacher);

            List<com.forsight.dto.ChronicleDTO> chronicles = new java.util.ArrayList<>();
            for (Enrollment e : enrollments) {
                com.forsight.model.QuizSubmission latestSub = submissions.stream()
                        .filter(s -> s.getStudent().getId().equals(e.getStudent().getId()))
                        .filter(s -> {
                            if (s.getQuiz().getResource() != null) {
                                return s.getQuiz().getResource().getCourse().getId().equals(e.getCourse().getId());
                            } else {
                                return s.getQuiz().getClassName() != null && s.getQuiz().getClassName().equalsIgnoreCase(e.getCourse().getClassName())
                                    && s.getQuiz().getSubject() != null && s.getQuiz().getSubject().equalsIgnoreCase(e.getCourse().getName());
                            }
                        })
                        .max(java.util.Comparator.comparing(com.forsight.model.QuizSubmission::getId))
                        .orElse(null);

                String status = latestSub != null ? ("PENDING".equals(latestSub.getStatus()) ? "Needs Review" : "Up to Date") : "Enrolled";
                String feedback = latestSub != null && latestSub.getFeedback() != null ? latestSub.getFeedback() : "No feedback yet";
                String resourceName = latestSub != null && latestSub.getQuiz().getResource() != null ? latestSub.getQuiz().getResource().getTitle() : "Course Overview";
                String quizTitle = latestSub != null ? latestSub.getQuiz().getTitle() : "No active assignments";
                LocalDateTime lastUpdate = latestSub != null ? latestSub.getEvaluationDate() : e.getEnrollmentDate();

                chronicles.add(new com.forsight.dto.ChronicleDTO(
                        e.getCourse().getId(),
                        e.getCourse().getName(),
                        e.getCourse().getClassName(),
                        status,
                        feedback,
                        lastUpdate,
                        e.getStudent().getId(),
                        e.getStudent().getName(),
                        e.getStudent().getEmail(),
                        teacher.getId(),
                        teacher.getName(),
                        resourceName,
                        quizTitle
                ));
            }

            return ResponseEntity.ok(chronicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseEnrollments(@PathVariable("courseId") Long courseId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByTeacherId(teacher.getId());
            List<Enrollment> courseEnrollments = enrollments.stream()
                    .filter(e -> e.getCourse().getId().equals(courseId))
                    .toList();

            return ResponseEntity.ok(courseEnrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
