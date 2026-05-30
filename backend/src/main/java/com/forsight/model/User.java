package com.forsight.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    private String subject; // for teachers
    
    private String grade; // for students
    
    private String status; // e.g., "Active"
    
    private String avatarUrl; // Profile picture URL

    // Default Constructor
    public User() {}

    // Full Constructor
    public User(Long id, String name, String email, String password, Role role, String subject, String grade, String status, String avatarUrl) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.subject = subject;
        this.grade = grade;
        this.status = status;
        this.avatarUrl = avatarUrl;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    // Custom Builder
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private Role role;
        private String subject;
        private String grade;
        private String status;
        private String avatarUrl;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder subject(String subject) { this.subject = subject; return this; }
        public UserBuilder grade(String grade) { this.grade = grade; return this; }
        public UserBuilder status(String status) { this.status = status; return this; }
        public UserBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }

        public User build() {
            return new User(id, name, email, password, role, subject, grade, status, avatarUrl);
        }
    }
}
