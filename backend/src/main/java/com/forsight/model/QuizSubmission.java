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

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "answer_image_url")
    private String answerImageUrl;

    private Integer score;

    @Column(name = "max_score")
    private Integer maxScore;

    private String status; // "PENDING", "GRADED"

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "evaluation_date")
    private LocalDateTime evaluationDate;

    @Column(name = "attempt_number", columnDefinition = "integer default 1")
    private Integer attemptNumber = 1;

    @Column(name = "resubmission_note", columnDefinition = "TEXT")
    private String resubmissionNote;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "resource_opened")
    private Boolean resourceOpened = false;

    // Constructors
    public QuizSubmission() {
        this.submissionDate = LocalDateTime.now();
    }

    public QuizSubmission(Long id, Quiz quiz, User student, String answersJson, String answerText, String answerImageUrl, Integer score, Integer maxScore, String status, String feedback, LocalDateTime evaluationDate, Integer attemptNumber, String resubmissionNote, LocalDateTime startTime, Boolean resourceOpened) {
        this.id = id;
        this.quiz = quiz;
        this.student = student;
        this.answersJson = answersJson;
        this.answerText = answerText;
        this.answerImageUrl = answerImageUrl;
        this.score = score;
        this.maxScore = maxScore;
        this.status = status;
        this.feedback = feedback;
        this.evaluationDate = evaluationDate;
        this.attemptNumber = attemptNumber != null ? attemptNumber : 1;
        this.resubmissionNote = resubmissionNote;
        this.startTime = startTime;
        this.resourceOpened = resourceOpened != null ? resourceOpened : false;
        this.submissionDate = LocalDateTime.now();
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

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }

    public String getAnswerImageUrl() { return answerImageUrl; }
    public void setAnswerImageUrl(String answerImageUrl) { this.answerImageUrl = answerImageUrl; }

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

    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }

    public String getResubmissionNote() { return resubmissionNote; }
    public void setResubmissionNote(String resubmissionNote) { this.resubmissionNote = resubmissionNote; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public Boolean getResourceOpened() { return resourceOpened; }
    public void setResourceOpened(Boolean resourceOpened) { this.resourceOpened = resourceOpened; }

    // Builder
    public static QuizSubmissionBuilder builder() {
        return new QuizSubmissionBuilder();
    }

    public static class QuizSubmissionBuilder {
        private Long id;
        private Quiz quiz;
        private User student;
        private String answersJson;
        private String answerText;
        private String answerImageUrl;
        private Integer score;
        private Integer maxScore;
        private String status;
        private String feedback;
        private LocalDateTime evaluationDate;
        private Integer attemptNumber = 1;
        private String resubmissionNote;
        private LocalDateTime startTime;
        private Boolean resourceOpened = false;
        private LocalDateTime submissionDate = LocalDateTime.now();

        public QuizSubmissionBuilder id(Long id) { this.id = id; return this; }
        public QuizSubmissionBuilder quiz(Quiz quiz) { this.quiz = quiz; return this; }
        public QuizSubmissionBuilder student(User student) { this.student = student; return this; }
        public QuizSubmissionBuilder answersJson(String answersJson) { this.answersJson = answersJson; return this; }
        public QuizSubmissionBuilder answerText(String answerText) { this.answerText = answerText; return this; }
        public QuizSubmissionBuilder answerImageUrl(String answerImageUrl) { this.answerImageUrl = answerImageUrl; return this; }
        public QuizSubmissionBuilder score(Integer score) { this.score = score; return this; }
        public QuizSubmissionBuilder maxScore(Integer maxScore) { this.maxScore = maxScore; return this; }
        public QuizSubmissionBuilder status(String status) { this.status = status; return this; }
        public QuizSubmissionBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public QuizSubmissionBuilder evaluationDate(LocalDateTime evaluationDate) { this.evaluationDate = evaluationDate; return this; }
        public QuizSubmissionBuilder attemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; return this; }
        public QuizSubmissionBuilder resubmissionNote(String resubmissionNote) { this.resubmissionNote = resubmissionNote; return this; }
        public QuizSubmissionBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public QuizSubmissionBuilder resourceOpened(Boolean resourceOpened) { this.resourceOpened = resourceOpened; return this; }
        public QuizSubmissionBuilder submissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; return this; }

        public QuizSubmission build() {
            QuizSubmission q = new QuizSubmission(id, quiz, student, answersJson, answerText, answerImageUrl, score, maxScore, status, feedback, evaluationDate, attemptNumber, resubmissionNote, startTime, resourceOpened);
            q.setSubmissionDate(this.submissionDate != null ? this.submissionDate : LocalDateTime.now());
            return q;
        }
    }
}
