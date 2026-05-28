package com.forsight.controller;

import com.forsight.model.Quiz;
import com.forsight.model.QuizSubmission;
import com.forsight.model.User;
import com.forsight.repository.QuizRepository;
import com.forsight.repository.QuizSubmissionRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class QuizSubmissionController {

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    public static class SubmissionRequest {
        private Long quizId;
        private String answersJson;
        private Integer score;
        private Integer maxScore;

        public Long getQuizId() { return quizId; }
        public void setQuizId(Long quizId) { this.quizId = quizId; }

        public String getAnswersJson() { return answersJson; }
        public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }

        public Integer getMaxScore() { return maxScore; }
        public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    }

    public static class GradeRequest {
        private Integer score;
        private String feedback;

        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }

        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }

    @PostMapping
    public ResponseEntity<?> submitQuiz(@RequestBody SubmissionRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User student = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Quiz quiz = quizRepository.findById(request.getQuizId())
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Check if student already submitted this quiz to avoid duplicates
            quizSubmissionRepository.findByQuizAndStudent(quiz, student)
                    .ifPresent(qs -> { throw new RuntimeException("Quiz already submitted by you"); });

            QuizSubmission submission = QuizSubmission.builder()
                    .quiz(quiz)
                    .student(student)
                    .answersJson(request.getAnswersJson())
                    .score(request.getScore())
                    .maxScore(request.getMaxScore())
                    .status("PENDING")
                    .build();

            QuizSubmission savedSubmission = quizSubmissionRepository.save(submission);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubmission);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<QuizSubmission>> getSubmissions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizSubmission> submissions;
        if (currentUser.getRole().name().equals("STUDENT")) {
            // Student sees only their own submissions
            submissions = quizSubmissionRepository.findByStudent(currentUser);
        } else if (currentUser.getRole().name().equals("TEACHER")) {
            // Teacher sees all submissions for quizzes they created
            submissions = quizSubmissionRepository.findByQuizTeacher(currentUser);
        } else {
            // Admin sees all submissions
            submissions = quizSubmissionRepository.findAll();
        }

        return ResponseEntity.ok(submissions);
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable("id") Long id, @RequestBody GradeRequest request) {
        try {
            QuizSubmission submission = quizSubmissionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Submission not found"));

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Verify teacher created this quiz
            if (!submission.getQuiz().getTeacher().getId().equals(teacher.getId()) && !teacher.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only the quiz owner can grade this submission");
            }

            submission.setScore(request.getScore());
            submission.setFeedback(request.getFeedback());
            submission.setStatus("GRADED");
            submission.setEvaluationDate(LocalDateTime.now());

            QuizSubmission updatedSubmission = quizSubmissionRepository.save(submission);
            return ResponseEntity.ok(updatedSubmission);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
