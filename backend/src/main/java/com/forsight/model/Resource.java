package com.forsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_data", length = 10485760) // 10 MB
    private byte[] fileData;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    // Constructors
    public Resource() {}

    public Resource(Long id, String title, String description, Course course, String fileName, String fileType, byte[] fileData, User teacher, LocalDateTime uploadDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.course = course;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileData = fileData;
        this.teacher = teacher;
        this.uploadDate = uploadDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

    // Builder
    public static ResourceBuilder builder() {
        return new ResourceBuilder();
    }

    public static class ResourceBuilder {
        private Long id;
        private String title;
        private String description;
        private Course course;
        private String fileName;
        private String fileType;
        private byte[] fileData;
        private User teacher;
        private LocalDateTime uploadDate;

        public ResourceBuilder id(Long id) { this.id = id; return this; }
        public ResourceBuilder title(String title) { this.title = title; return this; }
        public ResourceBuilder description(String description) { this.description = description; return this; }
        public ResourceBuilder course(Course course) { this.course = course; return this; }
        public ResourceBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public ResourceBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public ResourceBuilder fileData(byte[] fileData) { this.fileData = fileData; return this; }
        public ResourceBuilder teacher(User teacher) { this.teacher = teacher; return this; }
        public ResourceBuilder uploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; return this; }

        public Resource build() {
            return new Resource(id, title, description, course, fileName, fileType, fileData, teacher, uploadDate);
        }
    }
}
