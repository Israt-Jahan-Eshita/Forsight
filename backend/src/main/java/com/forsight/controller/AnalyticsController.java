package com.forsight.controller;

import com.forsight.model.SystemLog;
import com.forsight.model.User;
import com.forsight.model.QuizSubmission;
import com.forsight.model.Role;
import com.forsight.repository.UserRepository;
import com.forsight.repository.QuizSubmissionRepository;
import com.forsight.service.SystemLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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

    @Autowired
    private com.forsight.service.AnalyticsService analyticsService;

    @Autowired
    private com.forsight.repository.EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.forsight.repository.CourseRepository courseRepository;

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

            double healthPercentage = 90.0;
            if (gradedCount > 0) {
                healthPercentage = totalScorePercentage / gradedCount;
            }

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

    @GetMapping("/analytics/students-risk")
    public ResponseEntity<?> getStudentsRisk() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<com.forsight.model.Enrollment> enrollments = enrollmentRepository.findByTeacherId(teacher.getId());
            java.util.Set<User> students = enrollments.stream().map(com.forsight.model.Enrollment::getStudent).collect(java.util.stream.Collectors.toSet());
            List<QuizSubmission> allSubmissions = quizSubmissionRepository.findByQuizTeacher(teacher);

            List<Map<String, Object>> riskList = new java.util.ArrayList<>();

            for (User student : students) {
                List<QuizSubmission> studentSubs = allSubmissions.stream()
                        .filter(s -> s.getStudent().getId().equals(student.getId()))
                        .sorted(java.util.Comparator.comparing(QuizSubmission::getSubmissionDate))
                        .toList();
                String courseName = "General";
                if (!enrollments.isEmpty()) {
                    courseName = enrollments.stream()
                            .filter(e -> e.getStudent().getId().equals(student.getId()))
                            .map(e -> e.getCourse().getName())
                            .findFirst().orElse("General");
                }

                Map<String, Object> riskData = analyticsService.calculateStudentRisk(student);
                riskData.put("courseName", courseName);

                riskList.add(riskData);
            }

            riskList.sort((a, b) -> Integer.compare((Integer) b.get("riskScore"), (Integer) a.get("riskScore")));

            return ResponseEntity.ok(riskList);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/analytics/engagement-trend")
    public ResponseEntity<?> getEngagementTrend() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<QuizSubmission> allSubmissions = quizSubmissionRepository.findByQuizTeacher(teacher);
            
            List<Map<String, Object>> trend = new java.util.ArrayList<>();
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("EEE");

            for (int i = 6; i >= 0; i--) {
                java.time.LocalDate targetDate = today.minusDays(i);
                String dayName = targetDate.format(formatter);
                
                int dailyEngagementCount = 0;
                double totalScorePct = 0.0;
                int gradedCount = 0;

                for (QuizSubmission sub : allSubmissions) {
                    if (sub.getSubmissionDate() != null) {
                        java.time.LocalDate subDate = sub.getSubmissionDate().toLocalDate();
                        if (subDate.equals(targetDate)) {
                            dailyEngagementCount += 10;
                            
                            if ("GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                                totalScorePct += ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                                gradedCount++;
                            }
                        }
                    }
                }
                
                int avgScore = gradedCount > 0 ? (int) Math.round(totalScorePct / gradedCount) : 0;
                int engagement = Math.min(100, dailyEngagementCount);
                
                trend.add(Map.of(
                        "day", dayName,
                        "engagement", engagement,
                        "avgScore", avgScore
                ));
            }
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== NEW: Per-Student Deep Analytics ====================

    @GetMapping("/analytics/student/{id}/detail")
    public ResponseEntity<?> getStudentDetail(@PathVariable Long id) {
        try {
            User student = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<QuizSubmission> subs = quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(student);

            // --- 1. Score Trend (last 30 days, grouped by submission date) ---
            java.time.LocalDate today = java.time.LocalDate.now();
            List<Map<String, Object>> scoreTrend = new java.util.ArrayList<>();
            for (int i = 29; i >= 0; i--) {
                java.time.LocalDate targetDate = today.minusDays(i);
                double dayTotal = 0; int dayCount = 0;
                for (QuizSubmission sub : subs) {
                    if (sub.getSubmissionDate() != null && sub.getSubmissionDate().toLocalDate().equals(targetDate)
                            && "GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                        dayTotal += ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                        dayCount++;
                    }
                }
                if (dayCount > 0) {
                    scoreTrend.add(Map.of("day", String.valueOf(30 - i), "score", (int) Math.round(dayTotal / dayCount)));
                }
            }
            // If no real data points, create summary from all submissions ordered
            if (scoreTrend.isEmpty()) {
                int idx = 1;
                for (QuizSubmission sub : subs) {
                    if ("GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                        int pct = (int) Math.round(((double) sub.getScore() / sub.getMaxScore()) * 100.0);
                        scoreTrend.add(Map.of("day", String.valueOf(idx++), "score", pct));
                    }
                }
            }

            // --- 2. Engagement Radar (from behavioral signals) ---
            int totalSubs = subs.size();
            int resourceOpenCount = 0;
            int multiAttempt = 0;
            long totalTimeSpent = 0;
            int timeCount = 0;
            int gradedCount = 0;
            double totalScorePct = 0;

            for (QuizSubmission sub : subs) {
                if (Boolean.TRUE.equals(sub.getResourceOpened())) resourceOpenCount++;
                if (sub.getAttemptNumber() != null && sub.getAttemptNumber() > 1) multiAttempt++;
                if (sub.getStartTime() != null && sub.getSubmissionDate() != null) {
                    long seconds = java.time.Duration.between(sub.getStartTime(), sub.getSubmissionDate()).getSeconds();
                    if (seconds > 0 && seconds < 7200) { totalTimeSpent += seconds; timeCount++; }
                }
                if ("GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                    totalScorePct += ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                    gradedCount++;
                }
            }

            int quizScore = gradedCount > 0 ? (int) Math.round(totalScorePct / gradedCount) : 0;
            int participation = totalSubs > 0 ? Math.min(100, totalSubs * 20) : 0;
            int resourceEngagement = totalSubs > 0 ? (int) Math.round((resourceOpenCount / (double) totalSubs) * 100) : 0;
            int persistence = totalSubs > 0 ? Math.min(100, (int) Math.round((multiAttempt / (double) totalSubs) * 100) + 30) : 0;
            int avgTimeMin = timeCount > 0 ? (int) (totalTimeSpent / timeCount / 60) : 0;
            int timeEngagement = Math.min(100, avgTimeMin * 10);

            List<Map<String, Object>> engagementRadar = List.of(
                Map.of("subject", "Participation", "A", participation, "fullMark", 100),
                Map.of("subject", "Resource Study", "A", resourceEngagement, "fullMark", 100),
                Map.of("subject", "Quiz Score", "A", quizScore, "fullMark", 100),
                Map.of("subject", "Persistence", "A", persistence, "fullMark", 100),
                Map.of("subject", "Time Invested", "A", timeEngagement, "fullMark", 100)
            );

            // --- 3. Cohort Comparison ---
            // Get class average from all submissions by the teacher who teaches this student
            List<com.forsight.model.Enrollment> studentEnrollments = enrollmentRepository.findByStudentId(student.getId());
            double classTotal = 0; int classCount = 0; double topTotal = 0; int topCount = 0;

            if (!studentEnrollments.isEmpty()) {
                User teacher = studentEnrollments.get(0).getTeacher();
                List<QuizSubmission> allTeacherSubs = quizSubmissionRepository.findByQuizTeacher(teacher);
                java.util.Map<Long, java.util.List<Double>> studentScores = new java.util.HashMap<>();

                for (QuizSubmission sub : allTeacherSubs) {
                    if ("GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                        double pct = ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                        classTotal += pct; classCount++;
                        studentScores.computeIfAbsent(sub.getStudent().getId(), k -> new java.util.ArrayList<>()).add(pct);
                    }
                }
                // Top 10% = get per-student averages, sort, take top 10%
                List<Double> studentAvgs = studentScores.values().stream()
                    .map(scores -> scores.stream().mapToDouble(d -> d).average().orElse(0))
                    .sorted(java.util.Comparator.reverseOrder())
                    .collect(java.util.stream.Collectors.toList());

                int top10Count = Math.max(1, studentAvgs.size() / 10);
                for (int i = 0; i < top10Count && i < studentAvgs.size(); i++) {
                    topTotal += studentAvgs.get(i); topCount++;
                }
            }

            int classAvg = classCount > 0 ? (int) Math.round(classTotal / classCount) : 0;
            int top10Avg = topCount > 0 ? (int) Math.round(topTotal / topCount) : 0;

            List<Map<String, Object>> cohortCompare = List.of(
                Map.of("name", "This Student", "score", quizScore),
                Map.of("name", "Class Avg", "score", classAvg),
                Map.of("name", "Top 10%", "score", top10Avg)
            );

            // --- 4. Risk data ---
            Map<String, Object> riskData = analyticsService.calculateStudentRisk(student);

            // --- Combine all ---
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("scoreTrend", scoreTrend);
            result.put("engagementRadar", engagementRadar);
            result.put("cohortCompare", cohortCompare);
            result.put("riskData", riskData);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== NEW: Admin Stats (Real Data) ====================

    @GetMapping("/analytics/admin/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            long totalTeachers = userRepository.findByRole(Role.TEACHER).size();
            long totalStudents = userRepository.findByRole(Role.STUDENT).size();
            long totalCourses = courseRepository.count();
            long totalSubmissions = quizSubmissionRepository.count();

            // Critical alerts = students with risk score >= 75
            List<User> students = userRepository.findByRole(Role.STUDENT);
            int criticalAlerts = 0;
            for (User s : students) {
                Map<String, Object> risk = analyticsService.calculateStudentRisk(s);
                int riskScore = (Integer) risk.get("riskScore");
                if (riskScore >= 50) criticalAlerts++;
            }

            return ResponseEntity.ok(Map.of(
                "totalTeachers", totalTeachers,
                "totalStudents", totalStudents,
                "totalCourses", totalCourses,
                "totalSubmissions", totalSubmissions,
                "criticalAlerts", criticalAlerts
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

