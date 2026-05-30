package com.forsight.controller;

import com.forsight.model.Resource;
import com.forsight.model.User;
import com.forsight.model.Enrollment;
import com.forsight.model.QuizSubmission;
import com.forsight.repository.ResourceRepository;
import com.forsight.repository.UserRepository;
import com.forsight.repository.EnrollmentRepository;
import com.forsight.repository.QuizSubmissionRepository;
import com.forsight.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private com.forsight.service.SystemLogService systemLogService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    public static class NotesRequest {
        private Long resourceId;

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    }

    public static class ChatRequest {
        private Long resourceId;
        private String message;
        private String historyJson;

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getHistoryJson() { return historyJson; }
        public void setHistoryJson(String historyJson) { this.historyJson = historyJson; }
    }

    public static class PromptRequest {
        private String prompt;

        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
    }

    @PostMapping("/notes")
    public ResponseEntity<?> getSmartNotes(@RequestBody NotesRequest request) {
        try {
            Resource resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            String notes = aiService.generateNotes(resource);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> askAiAssistant(@RequestBody ChatRequest request) {
        try {
            Resource resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            String response = aiService.chatAboutResource(resource, request.getMessage(), request.getHistoryJson());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/generate-quiz")
    public ResponseEntity<?> generateQuiz(@RequestBody PromptRequest request) {
        try {
            String response = aiService.generateQuiz(request.getPrompt());
            systemLogService.logEvent("System generated a new practice quiz/deck via AI.", "INFO");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/generate-oped")
    public ResponseEntity<?> generateOpEd() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User teacher = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByTeacherId(teacher.getId());
            Set<User> students = enrollments.stream().map(Enrollment::getStudent).collect(Collectors.toSet());
            int totalStudents = students.size();

            List<QuizSubmission> submissions = quizSubmissionRepository.findByQuizTeacher(teacher);

            int safeCount = 0;
            int watchCount = 0;
            int criticalCount = 0;
            java.util.List<String> atRiskStudents = new java.util.ArrayList<>();
            java.util.Map<String, java.util.List<Double>> courseGrades = new java.util.HashMap<>();

            for (User student : students) {
                List<QuizSubmission> studentSubs = submissions.stream()
                        .filter(s -> s.getStudent().getId().equals(student.getId()))
                        .collect(Collectors.toList());

                double totalPct = 0.0;
                int gradedCount = 0;
                for (QuizSubmission sub : studentSubs) {
                    if ("GRADED".equals(sub.getStatus()) && sub.getScore() != null && sub.getMaxScore() != null && sub.getMaxScore() > 0) {
                        double pct = ((double) sub.getScore() / sub.getMaxScore()) * 100.0;
                        totalPct += pct;
                        gradedCount++;

                        if (sub.getQuiz().getResource() != null && sub.getQuiz().getResource().getCourse() != null) {
                            String courseName = sub.getQuiz().getResource().getCourse().getName();
                            courseGrades.computeIfAbsent(courseName, k -> new java.util.ArrayList<>()).add(pct);
                        }
                    }
                }

                if (gradedCount > 0) {
                    double avg = totalPct / gradedCount;
                    if (avg >= 85.0) {
                        safeCount++;
                    } else if (avg >= 70.0) {
                        watchCount++;
                        atRiskStudents.add(student.getName() + " (" + Math.round(avg) + "%)");
                    } else {
                        criticalCount++;
                        atRiskStudents.add(student.getName() + " (" + Math.round(avg) + "%)");
                    }
                } else {
                    safeCount++; // Default to safe if no graded work yet
                }
            }

            String riskSubject = "None (No graded work yet)";
            double lowestAvg = 100.0;
            for (Map.Entry<String, java.util.List<Double>> entry : courseGrades.entrySet()) {
                double sum = 0.0;
                for (Double g : entry.getValue()) {
                    sum += g;
                }
                double avg = sum / entry.getValue().size();
                if (avg < lowestAvg) {
                    lowestAvg = avg;
                    riskSubject = entry.getKey() + " (" + Math.round(avg) + "%)";
                }
            }

            String atRiskStudentNames = atRiskStudents.isEmpty()
                    ? "None"
                    : String.join(", ", atRiskStudents.stream().limit(3).collect(Collectors.toList()));

            int recoveryProb = 95;
            if (totalStudents > 0) {
                recoveryProb = (int) Math.round(((double) safeCount / totalStudents) * 100.0);
                if (recoveryProb < 20) recoveryProb = 20;
                if (recoveryProb > 95) recoveryProb = 95;
            }

            // Raw classroom stats constructed dynamically
            String statsContext = "Total Students: " + totalStudents + ". Safe: " + safeCount + ". Watch: " + watchCount + ". Critical: " + criticalCount + ". " +
                    "Subject area with most risk: " + riskSubject + ". " +
                    "Top At-Risk Students: " + atRiskStudentNames + ". " +
                    "Expected recovery probability if direct action taken: " + recoveryProb + "%.";

            String prompt = "Write a 2-paragraph highly formal briefing. " +
                    "Paragraph 1: State the divergence or general trajectory based on these stats: " + statsContext + " " +
                    "Paragraph 2: Pinpoint the cause and recommend an action.";

            // Using the existing aiService logic to generate text
            String response = aiService.generateQuiz(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/student-insight")
    public ResponseEntity<?> generateStudentInsight(@RequestBody PromptRequest request) {
        try {
            String prompt = "You are an educational AI. Analyze the following student data and provide insights in exactly two sections separated by '|||'. " +
                    "Section 1: Why Struggling. Section 2: What To Do. Data: " + request.getPrompt();
            String response = aiService.generateQuiz(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/intervention-insight")
    public ResponseEntity<?> generateInterventionInsight(@RequestBody PromptRequest request) {
        try {
            String prompt = "You are an expert teacher's assistant AI. Based on the following student performance data and behavioral flags, provide a single, actionable, strict 1-sentence intervention strategy. Be highly specific and professional. Data: " + request.getPrompt();
            String response = aiService.generateQuiz(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/translate")
    public ResponseEntity<?> translateToBangla(@RequestBody PromptRequest request) {
        try {
            String prompt = "Translate the following educational progress report into highly formal and polite Bengali (Bangla) suitable for sending to a parent: " + request.getPrompt();
            String response = aiService.generateQuiz(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/general-chat")
    public ResponseEntity<?> generalChat(@RequestBody ChatRequest request) {
        try {
            String prompt = "You are Forsight Assistant, an AI guide for the 'Forsight' educational platform. " +
                            "CRITICAL INSTRUCTIONS: " +
                            "1. Keep answers extremely short (1-2 sentences max). " +
                            "2. ONLY answer questions related to education, learning, or navigating this platform. " +
                            "3. Do not generate code or long explanations. " +
                            "User message: " + request.getMessage() + "\n" +
                            "History: " + (request.getHistoryJson() != null ? request.getHistoryJson() : "None");
            
            // Reusing generateQuiz just to pass the text directly to the Groq call inside AiService
            // The AiService's generateQuiz method ignores resource context.
            String response = aiService.generateQuiz(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
