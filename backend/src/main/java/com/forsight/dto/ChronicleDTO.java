package com.forsight.dto;

import java.time.LocalDateTime;

public class ChronicleDTO {
    private Long courseId;
    private String courseName;
    private String className;
    private String status;
    private String latestFeedback;
    private LocalDateTime lastUpdate;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long teacherId;
    private String teacherName;
    private String resourceName;
    private String quizTitle;

    public ChronicleDTO() {}

    public ChronicleDTO(Long courseId, String courseName, String className, String status, String latestFeedback, LocalDateTime lastUpdate) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.className = className;
        this.status = status;
        this.latestFeedback = latestFeedback;
        this.lastUpdate = lastUpdate;
    }

    public ChronicleDTO(Long courseId, String courseName, String className, String status, String latestFeedback, LocalDateTime lastUpdate, Long studentId, String studentName, String studentEmail) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.className = className;
        this.status = status;
        this.latestFeedback = latestFeedback;
        this.lastUpdate = lastUpdate;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
    }

    public ChronicleDTO(Long courseId, String courseName, String className, String status, String latestFeedback, LocalDateTime lastUpdate, Long studentId, String studentName, String studentEmail, Long teacherId, String teacherName, String resourceName, String quizTitle) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.className = className;
        this.status = status;
        this.latestFeedback = latestFeedback;
        this.lastUpdate = lastUpdate;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.resourceName = resourceName;
        this.quizTitle = quizTitle;
    }


    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLatestFeedback() {
        return latestFeedback;
    }

    public void setLatestFeedback(String latestFeedback) {
        this.latestFeedback = latestFeedback;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(LocalDateTime lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
}
