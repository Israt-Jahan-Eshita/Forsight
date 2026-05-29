package com.forsight.controller;

import com.forsight.model.SystemLog;
import com.forsight.model.User;
import com.forsight.model.QuizSubmission;
import com.forsight.repository.UserRepository;
import com.forsight.repository.QuizSubmissionRepository;
import com.forsight.service.SystemLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    @Autowired
    private SystemLogService systemLogService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @GetMapping("/logs/recent")
    public ResponseEntity<?> getRecentLogs() {
        try {
            List<SystemLog> logs = systemLogService.getRecentLogs();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/analytics/classroom-health")
    public ResponseEntity<?> getClassroomHealth() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<QuizSubmission> submissions = quizSubmissionRepository.findByQuizTeacher(teacher);

            double totalScorePercentage = 0.0;
            int gradedCount = 0;
            int pendingCount = 0;

            for (QuizSubmission sub : submissions) {
                if ("GRADED".equals(sub.getStatus())) {
                    if (sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                        totalScorePercentage += ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                        gradedCount++;
                    }
                } else if ("PENDING".equals(sub.getStatus())) {
                    pendingCount++;
                }
            }

            double healthPercentage = 90.0; // Default safe baseline if no graded submissions
            if (gradedCount > 0) {
                healthPercentage = totalScorePercentage / gradedCount;
            }

            // Adjust health score slightly based on pending submissions awaiting review (stress / risk indicator)
            healthPercentage -= pendingCount * 1.5;
            if (healthPercentage < 0.0) {
                healthPercentage = 0.0;
            } else if (healthPercentage > 100.0) {
                healthPercentage = 100.0;
            }

            int roundedHealth = (int) Math.round(healthPercentage);
            String status = roundedHealth > 85 ? "Safe" : (roundedHealth >= 70 ? "Watch" : "Critical");

            return ResponseEntity.ok(Map.of(
                    "healthScore", roundedHealth,
                    "status", status
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Autowired
    private com.forsight.repository.EnrollmentRepository enrollmentRepository;

    @GetMapping("/analytics/students")
    public ResponseEntity<?> getStudentAnalytics() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<com.forsight.model.Enrollment> enrollments = enrollmentRepository.findByTeacherId(teacher.getId());
            java.util.Set<User> students = enrollments.stream().map(com.forsight.model.Enrollment::getStudent).collect(java.util.stream.Collectors.toSet());
            List<QuizSubmission> allSubmissions = quizSubmissionRepository.findByQuizTeacher(teacher);

            List<Map<String, Object>> studentAnalyticsList = new java.util.ArrayList<>();

            for (User student : students) {
                List<QuizSubmission> studentSubs = allSubmissions.stream()
                        .filter(s -> s.getStudent().getId().equals(student.getId()))
                        .toList();

                double totalPct = 0.0;
                int gradedCount = 0;
                int pendingCount = 0;
                Map<String, java.util.List<Double>> courseGrades = new java.util.HashMap<>();

                for (QuizSubmission sub : studentSubs) {
                    if ("PENDING".equals(sub.getStatus())) {
                        pendingCount++;
                    } else if ("GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                        double pct = ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                        totalPct += pct;
                        gradedCount++;

                        if (sub.getQuiz().getResource() != null && sub.getQuiz().getResource().getCourse() != null) {
                            String courseName = sub.getQuiz().getResource().getCourse().getName();
                            courseGrades.computeIfAbsent(courseName, k -> new java.util.ArrayList<>()).add(pct);
                        }
                    }
                }

                double avg = gradedCount > 0 ? totalPct / gradedCount : 100.0;
                int roundedAvg = (int) Math.round(avg);
                String riskLevel = roundedAvg >= 85 ? "Safe" : (roundedAvg >= 70 ? "Watch" : "Critical");

                String weakestSubject = "None";
                double lowestAvg = 100.0;
                for (Map.Entry<String, java.util.List<Double>> entry : courseGrades.entrySet()) {
                    double sum = 0.0;
                    for (Double g : entry.getValue()) sum += g;
                    double courseAvg = sum / entry.getValue().size();
                    if (courseAvg < lowestAvg) {
                        lowestAvg = courseAvg;
                        weakestSubject = entry.getKey();
                    }
                }

                Map<String, Object> stats = new java.util.HashMap<>();
                stats.put("id", student.getId());
                stats.put("name", student.getName());
                stats.put("email", student.getEmail());
                stats.put("gradeAverage", roundedAvg);
                stats.put("riskLevel", riskLevel);
                stats.put("weakestSubject", weakestSubject.equals("None") ? "N/A" : weakestSubject);
                stats.put("totalSubmissions", studentSubs.size());
                stats.put("pendingSubmissions", pendingCount);
                stats.put("gradedCount", gradedCount);

                List<String> enrolledCourses = enrollments.stream()
                        .filter(e -> e.getStudent().getId().equals(student.getId()))
                        .map(e -> e.getCourse().getName())
                        .toList();
                stats.put("enrolledCourses", enrolledCourses);

                studentAnalyticsList.add(stats);
            }

            return ResponseEntity.ok(studentAnalyticsList);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
