package com.forsight.controller;

import com.forsight.model.User;
import com.forsight.model.Message;
import com.forsight.model.QuizSubmission;
import com.forsight.model.Enrollment;
import com.forsight.model.Resource;
import com.forsight.repository.UserRepository;
import com.forsight.repository.MessageRepository;
import com.forsight.repository.QuizSubmissionRepository;
import com.forsight.repository.EnrollmentRepository;
import com.forsight.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping("/notifications")
    public ResponseEntity<?> getUserNotifications() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Map<String, Object>> notifications = new ArrayList<>();

            // 1. Dynamic Alert: New Unread Messages (Both Teacher and Student)
            List<Message> unreadMessages = messageRepository.findUnreadMessages(user);
            for (Message msg : unreadMessages) {
                Map<String, Object> notif = new HashMap<>();
                notif.put("id", "msg-" + msg.getId());
                notif.put("title", "New Message");
                notif.put("message", "From " + msg.getSender().getName() + ": \"" + 
                          (msg.getContent().length() > 50 ? msg.getContent().substring(0, 47) + "..." : msg.getContent()) + "\"");
                notif.put("timestamp", msg.getTimestamp());
                notif.put("type", "info");
                notif.put("link", "/messages");
                notifications.add(notif);
            }

            if ("teacher".equalsIgnoreCase(user.getRole().toString())) {
                // --- TEACHER NOTIFICATIONS ---

                // 2. Dynamic Alert: New Student Enrollments
                List<Enrollment> enrollments = enrollmentRepository.findByTeacherId(user.getId());
                for (Enrollment e : enrollments) {
                    Map<String, Object> notif = new HashMap<>();
                    notif.put("id", "enrol-" + e.getId());
                    notif.put("title", "New Student Enrollment");
                    notif.put("message", e.getStudent().getName() + " enrolled in " + e.getCourse().getName() + ".");
                    notif.put("timestamp", e.getEnrollmentDate() != null ? e.getEnrollmentDate() : LocalDateTime.now().minusDays(1));
                    notif.put("type", "success");
                    notif.put("link", "/students");
                    notifications.add(notif);
                }

                // 3. Dynamic Alert: New Quiz Submissions (Pending Grading)
                List<QuizSubmission> submissions = quizSubmissionRepository.findByQuizTeacher(user);
                for (QuizSubmission sub : submissions) {
                    if ("PENDING".equals(sub.getStatus())) {
                        Map<String, Object> notif = new HashMap<>();
                        notif.put("id", "sub-" + sub.getId());
                        notif.put("title", "Quiz Awaiting Review");
                        notif.put("message", sub.getStudent().getName() + " submitted \"" + sub.getQuiz().getTitle() + "\".");
                        notif.put("timestamp", sub.getSubmissionDate() != null ? sub.getSubmissionDate() : LocalDateTime.now());
                        notif.put("type", "warning");
                        notif.put("link", "/submissions");
                        notifications.add(notif);
                    }
                }
            } else {
                // --- STUDENT NOTIFICATIONS ---

                // 4. Dynamic Alert: Newly Evaluated Submissions (Grades/Feedback posted)
                List<QuizSubmission> submissions = quizSubmissionRepository.findByStudent(user);
                for (QuizSubmission sub : submissions) {
                    if ("GRADED".equals(sub.getStatus())) {
                        Map<String, Object> notif = new HashMap<>();
                        notif.put("id", "grad-" + sub.getId());
                        notif.put("title", "Quiz Graded");
                        notif.put("message", "Your submission for \"" + sub.getQuiz().getTitle() + "\" has been evaluated. Score: " + sub.getScore() + "/" + sub.getMaxScore());
                        notif.put("timestamp", sub.getEvaluationDate() != null ? sub.getEvaluationDate() : LocalDateTime.now());
                        notif.put("type", "success");
                        notif.put("link", "/submissions");
                        notifications.add(notif);
                    } else if ("RESUBMISSION_REQUESTED".equals(sub.getStatus())) {
                        // 5. Dynamic Alert: Resubmission Requests
                        Map<String, Object> notif = new HashMap<>();
                        notif.put("id", "resub-" + sub.getId());
                        notif.put("title", "Resubmission Requested");
                        notif.put("message", "Instructor requested a resubmission for \"" + sub.getQuiz().getTitle() + "\". Feedback: \"" + sub.getFeedback() + "\"");
                        notif.put("timestamp", sub.getEvaluationDate() != null ? sub.getEvaluationDate() : LocalDateTime.now());
                        notif.put("type", "danger");
                        notif.put("link", "/submissions");
                        notifications.add(notif);
                    }
                }

                // 6. Dynamic Alert: Course Updates / New Resource Uploads
                List<Enrollment> studentEnrollments = enrollmentRepository.findByStudentId(user.getId());
                for (Enrollment e : studentEnrollments) {
                    if (e.getCourse() != null) {
                        List<Resource> resources = resourceRepository.findByCourse_Id(e.getCourse().getId());
                        for (Resource res : resources) {
                            Map<String, Object> notif = new HashMap<>();
                            notif.put("id", "res-" + res.getId());
                            notif.put("title", "New Course Resource");
                            notif.put("message", "New file \"" + res.getTitle() + "\" uploaded in " + e.getCourse().getName() + ".");
                            notif.put("timestamp", res.getUploadDate() != null ? res.getUploadDate() : LocalDateTime.now().minusDays(1));
                            notif.put("type", "info");
                            notif.put("link", "/resources");
                            notifications.add(notif);
                        }
                    }
                }
            }

            // Sort notifications by timestamp descending (newest first)
            notifications.sort((a, b) -> {
                LocalDateTime t1 = (LocalDateTime) a.get("timestamp");
                LocalDateTime t2 = (LocalDateTime) b.get("timestamp");
                if (t1 == null && t2 == null) return 0;
                if (t1 == null) return 1;
                if (t2 == null) return -1;
                return t2.compareTo(t1);
            });

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
