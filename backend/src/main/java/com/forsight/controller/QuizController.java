package com.forsight.controller;

import com.forsight.model.Quiz;
import com.forsight.model.User;
import com.forsight.repository.QuizRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quizRequest) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            Quiz quiz = Quiz.builder()
                    .title(quizRequest.getTitle())
                    .description(quizRequest.getDescription())
                    .className(quizRequest.getClassName())
                    .subject(quizRequest.getSubject())
                    .questionsJson(quizRequest.getQuestionsJson())
                    .teacher(teacher)
                    .createdDate(LocalDateTime.now())
                    .build();

            Quiz savedQuiz = quizRepository.save(quiz);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzes(
            @RequestParam(value = "className", required = false) String className,
            @RequestParam(value = "subject", required = false) String subject) {

        List<Quiz> quizzes;
        if (className != null && !className.trim().isEmpty() && subject != null && !subject.trim().isEmpty()) {
            quizzes = quizRepository.findByClassNameAndSubject(className, subject);
        } else {
            quizzes = quizRepository.findAll();
        }

        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getClasses() {
        return ResponseEntity.ok(quizRepository.findDistinctClassNames());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects(@RequestParam("className") String className) {
        return ResponseEntity.ok(quizRepository.findDistinctSubjectsByClassName(className));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable("id") Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole().name().equals("ADMIN") || quiz.getTeacher().getId().equals(currentUser.getId())) {
            quizRepository.delete(quiz);
            return ResponseEntity.ok("Quiz deleted successfully");
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to delete quiz");
    }
}
