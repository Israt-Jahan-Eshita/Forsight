package com.forsight.service;

import com.forsight.model.SystemLog;
import com.forsight.model.Enrollment;
import com.forsight.model.QuizSubmission;
import com.forsight.repository.SystemLogRepository;
import com.forsight.repository.EnrollmentRepository;
import com.forsight.repository.QuizSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemLogService {

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    public void logEvent(String description, String type) {
        SystemLog log = new SystemLog(LocalDateTime.now(), description, type);
        systemLogRepository.save(log);
    }

    public List<SystemLog> getRecentLogs() {
        return systemLogRepository.findTop10ByOrderByTimestampDesc();
    }

    // Runs every day at 12:00 AM (midnight) to check for missing submissions
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkForMissedSubmissions() {
        // Logic to simulate checking for missed submissions
        // Real implementation would look at course quizzes and due dates vs actual submissions
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        
        // This is a naive heuristic for demonstration:
        // If a student is enrolled but has zero submissions across the system, log a warning
        for (Enrollment e : enrollments) {
            List<QuizSubmission> subs = quizSubmissionRepository.findByStudent(e.getStudent());
            if (subs.isEmpty()) {
                logEvent("Student " + e.getStudent().getName() + " missed expected submission threshold.", "WARNING");
            }
        }
    }
}
