package com.forsight.service;

import com.forsight.model.QuizSubmission;
import com.forsight.model.User;
import com.forsight.repository.QuizSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    public Map<String, Object> calculateStudentRisk(User student) {
        List<QuizSubmission> studentSubs = quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(student);

        double gradeDrop = 0.0;
        double missedDeadlines = 0.0; // Currently placeholder, assume 0 for MVP
        double timeVariance = 0.0;
        double resourceSkipping = 0.0;
        double zeroFeedback = 0.0;

        if (studentSubs.size() >= 2) {
            QuizSubmission last = studentSubs.get(studentSubs.size() - 1);
            QuizSubmission prev = studentSubs.get(studentSubs.size() - 2);
            if (last.getScore() != null && prev.getScore() != null && last.getMaxScore() != null && prev.getMaxScore() != null) {
                double lastPct = ((double) last.getScore() / last.getMaxScore()) * 100;
                double prevPct = ((double) prev.getScore() / prev.getMaxScore()) * 100;
                if (lastPct < prevPct) {
                    gradeDrop = Math.min((prevPct - lastPct) * 2, 100);
                }
            }
        }

        int skippedResources = 0;
        int speedRuns = 0;
        int resilientFails = 0;

        for (QuizSubmission sub : studentSubs) {
            if (Boolean.FALSE.equals(sub.getResourceOpened())) {
                skippedResources++;
            }
            if (sub.getStartTime() != null) {
                long diffSeconds = java.time.Duration.between(sub.getStartTime(), sub.getSubmissionDate()).getSeconds();
                if (diffSeconds < 60) {
                    speedRuns++;
                }
            }
            if (sub.getAttemptNumber() > 1 && sub.getScore() != null && sub.getMaxScore() != null) {
                double pct = ((double) sub.getScore() / sub.getMaxScore()) * 100;
                if (pct < 50) {
                    resilientFails++;
                }
            }
        }

        if (studentSubs.size() > 0) {
            resourceSkipping = Math.min((skippedResources / (double) studentSubs.size()) * 100, 100);
            timeVariance = Math.min((speedRuns / (double) studentSubs.size()) * 100, 100);
            zeroFeedback = Math.min(resilientFails * 50, 100);
        }

        // Risk = (0.30 * Grade Drop) + (0.25 * Missed Deadlines) + (0.20 * Time Variance) + (0.15 * Resource Skipping) + (0.10 * Zero Feedback)
        double rawRisk = (0.30 * gradeDrop) + (0.25 * missedDeadlines) + (0.20 * timeVariance) + (0.15 * resourceSkipping) + (0.10 * zeroFeedback);
        int riskScore = (int) Math.round(rawRisk);
        if (riskScore > 100) riskScore = 100;

        String status = riskScore >= 75 ? "Critical" : (riskScore >= 50 ? "At-Risk" : (riskScore >= 25 ? "Watch" : "Safe"));

        List<String> behavioralFlags = new ArrayList<>();
        if (timeVariance >= 50) behavioralFlags.add("Speed-runner");
        if (resourceSkipping >= 50) behavioralFlags.add("Resource Skipper");
        if (gradeDrop >= 40) behavioralFlags.add("Sharp Grade Drop");
        if (zeroFeedback >= 50) behavioralFlags.add("Low Resilience");

        Map<String, Object> riskData = new HashMap<>();
        riskData.put("id", student.getId());
        riskData.put("name", student.getName());
        riskData.put("email", student.getEmail());
        riskData.put("status", status);
        riskData.put("riskScore", riskScore);
        riskData.put("behavioralFlags", behavioralFlags);
        
        return riskData;
    }
}
