package com.forsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_submissions")
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson; // JSON representation of selected options

    private Integer score;

    @Column(name = "max_score")
    private Integer maxScore;

    private String status; // "PENDING", "GRADED"

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "evaluation_date")
    private LocalDateTime evaluationDate;

    // Constructors
    public QuizSubmission() {}

    public QuizSubmission(Long id, Quiz quiz, User student, String answersJson, Integer score, Integer maxScore, String status, String feedback, LocalDateTime evaluationDate) {
        this.id = id;
        this.quiz = quiz;
        this.student = student;
        this.answersJson = answersJson;
        this.score = score;
        this.maxScore = maxScore;
        this.status = status;
        this.feedback = feedback;
        this.evaluationDate = evaluationDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(LocalDateTime evaluationDate) { this.evaluationDate = evaluationDate; }

    // Builder
    public static QuizSubmissionBuilder builder() {
        return new QuizSubmissionBuilder();
    }

    public static class QuizSubmissionBuilder {
        private Long id;
        private Quiz quiz;
        private User student;
        private String answersJson;
        private Integer score;
        private Integer maxScore;
        private String status;
        private String feedback;
        private LocalDateTime evaluationDate;

        public QuizSubmissionBuilder id(Long id) { this.id = id; return this; }
        public QuizSubmissionBuilder quiz(Quiz quiz) { this.quiz = quiz; return this; }
        public QuizSubmissionBuilder student(User student) { this.student = student; return this; }
        public QuizSubmissionBuilder answersJson(String answersJson) { this.answersJson = answersJson; return this; }
        public QuizSubmissionBuilder score(Integer score) { this.score = score; return this; }
        public QuizSubmissionBuilder maxScore(Integer maxScore) { this.maxScore = maxScore; return this; }
        public QuizSubmissionBuilder status(String status) { this.status = status; return this; }
        public QuizSubmissionBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public QuizSubmissionBuilder evaluationDate(LocalDateTime evaluationDate) { this.evaluationDate = evaluationDate; return this; }

        public QuizSubmission build() {
            return new QuizSubmission(id, quiz, student, answersJson, score, maxScore, status, feedback, evaluationDate);
        }
    }
}
