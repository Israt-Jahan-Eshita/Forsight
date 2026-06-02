package com.forsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "class_name")
    private String className;

    private String subject;

    @Column(name = "questions_json", columnDefinition = "TEXT")
    private String questionsJson; // JSON representation of questions

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "question_image_url")
    private String questionImageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    // Constructors
    public Quiz() {}

    public Quiz(Long id, String title, String description, String className, String subject, String questionsJson, String questionText, String questionImageUrl, Resource resource, User teacher, LocalDateTime createdDate, LocalDateTime dueDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.className = className;
        this.subject = subject;
        this.questionsJson = questionsJson;
        this.questionText = questionText;
        this.questionImageUrl = questionImageUrl;
        this.resource = resource;
        this.teacher = teacher;
        this.createdDate = createdDate;
        this.dueDate = dueDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getQuestionImageUrl() { return questionImageUrl; }
    public void setQuestionImageUrl(String questionImageUrl) { this.questionImageUrl = questionImageUrl; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    // Builder
    public static QuizBuilder builder() {
        return new QuizBuilder();
    }

    public static class QuizBuilder {
        private Long id;
        private String title;
        private String description;
        private String className;
        private String subject;
        private String questionsJson;
        private String questionText;
        private String questionImageUrl;
        private Resource resource;
        private User teacher;
        private LocalDateTime createdDate;
        private LocalDateTime dueDate;

        public QuizBuilder id(Long id) { this.id = id; return this; }
        public QuizBuilder title(String title) { this.title = title; return this; }
        public QuizBuilder description(String description) { this.description = description; return this; }
        public QuizBuilder className(String className) { this.className = className; return this; }
        public QuizBuilder subject(String subject) { this.subject = subject; return this; }
        public QuizBuilder questionsJson(String questionsJson) { this.questionsJson = questionsJson; return this; }
        public QuizBuilder questionText(String questionText) { this.questionText = questionText; return this; }
        public QuizBuilder questionImageUrl(String questionImageUrl) { this.questionImageUrl = questionImageUrl; return this; }
        public QuizBuilder resource(Resource resource) { this.resource = resource; return this; }
        public QuizBuilder teacher(User teacher) { this.teacher = teacher; return this; }
        public QuizBuilder createdDate(LocalDateTime createdDate) { this.createdDate = createdDate; return this; }
        public QuizBuilder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }

        public Quiz build() {
            return new Quiz(id, title, description, className, subject, questionsJson, questionText, questionImageUrl, resource, teacher, createdDate, dueDate);
        }
    }
}
