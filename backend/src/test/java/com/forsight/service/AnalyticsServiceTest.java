package com.forsight.service;

import com.forsight.model.*;
import com.forsight.repository.QuizSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the AnalyticsService risk scoring engine.
 * Validates that the weighted heuristic formula correctly categorizes students
 * based on behavioral telemetry signals (grade drops, speed-running, resource skipping,
 * missed deadlines, and low resilience).
 */
@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private QuizSubmissionRepository quizSubmissionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User safeStudent;
    private User criticalStudent;
    private User watchStudent;
    private User noDataStudent;
    private Quiz quizWithDeadline;
    private Quiz quizPastDeadline;

    @BeforeEach
    void setUp() {
        safeStudent = new User();
        safeStudent.setId(1L);
        safeStudent.setName("Sara Rahman");
        safeStudent.setEmail("sara@forsight.com");

        criticalStudent = new User();
        criticalStudent.setId(2L);
        criticalStudent.setName("Vikram Das");
        criticalStudent.setEmail("vikram@forsight.com");

        watchStudent = new User();
        watchStudent.setId(3L);
        watchStudent.setName("Aarav Patel");
        watchStudent.setEmail("aarav@forsight.com");

        noDataStudent = new User();
        noDataStudent.setId(4L);
        noDataStudent.setName("New Student");
        noDataStudent.setEmail("new@forsight.com");

        quizWithDeadline = new Quiz();
        quizWithDeadline.setId(1L);
        quizWithDeadline.setDueDate(LocalDateTime.now().minusDays(2));

        quizPastDeadline = new Quiz();
        quizPastDeadline.setId(2L);
        quizPastDeadline.setDueDate(LocalDateTime.now().minusDays(5));
    }

    @Test
    @DisplayName("Safe student with high scores should have low risk (Safe status)")
    void safeStudentShouldHaveLowRisk() {
        LocalDateTime now = LocalDateTime.now();
        List<QuizSubmission> submissions = List.of(
                createSubmission(quizWithDeadline, safeStudent, now.minusDays(4), 95, 100, 1, true, 3600),
                createSubmission(quizWithDeadline, safeStudent, now.minusDays(3), 92, 100, 1, true, 4000)
        );

        when(quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(safeStudent))
                .thenReturn(submissions);

        Map<String, Object> result = analyticsService.calculateStudentRisk(safeStudent);

        assertEquals("Safe", result.get("status"));
        assertTrue((Integer) result.get("riskScore") < 25,
                "Safe student risk score should be below 25, got: " + result.get("riskScore"));
        assertTrue(((List<?>) result.get("behavioralFlags")).isEmpty(),
                "Safe student should have no behavioral flags");
    }

    @Test
    @DisplayName("Critical student with grade drops, speed-running, and late submissions should have high risk")
    void criticalStudentShouldHaveHighRisk() {
        LocalDateTime now = LocalDateTime.now();
        List<QuizSubmission> submissions = List.of(
                createSubmission(quizPastDeadline, criticalStudent, now.minusDays(3), 85, 100, 1, true, 2000),
                createSubmission(quizWithDeadline, criticalStudent, now, 30, 100, 2, false, 45)
        );

        when(quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(criticalStudent))
                .thenReturn(submissions);

        Map<String, Object> result = analyticsService.calculateStudentRisk(criticalStudent);

        int riskScore = (Integer) result.get("riskScore");
        assertTrue(riskScore >= 25,
                "Critical student risk score should be >= 25, got: " + riskScore);

        List<?> flags = (List<?>) result.get("behavioralFlags");
        assertNotNull(flags, "Behavioral flags should not be null");
    }

    @Test
    @DisplayName("Student with no submissions should default to Safe with zero risk")
    void noDataStudentShouldBeSafe() {
        when(quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(noDataStudent))
                .thenReturn(Collections.emptyList());

        Map<String, Object> result = analyticsService.calculateStudentRisk(noDataStudent);

        assertEquals("Safe", result.get("status"));
        assertEquals(0, result.get("riskScore"));
        assertTrue(((List<?>) result.get("behavioralFlags")).isEmpty());
    }

    @Test
    @DisplayName("Student who misses all deadlines should trigger Deadline Missed flag")
    void missedDeadlinesShouldTriggerFlag() {
        LocalDateTime now = LocalDateTime.now();
        Quiz earlyDeadlineQuiz = new Quiz();
        earlyDeadlineQuiz.setId(10L);
        earlyDeadlineQuiz.setDueDate(now.minusDays(10));

        List<QuizSubmission> submissions = List.of(
                createSubmission(earlyDeadlineQuiz, watchStudent, now.minusDays(1), 80, 100, 1, true, 3000),
                createSubmission(earlyDeadlineQuiz, watchStudent, now, 75, 100, 1, true, 3000)
        );

        when(quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(watchStudent))
                .thenReturn(submissions);

        Map<String, Object> result = analyticsService.calculateStudentRisk(watchStudent);

        List<?> flags = (List<?>) result.get("behavioralFlags");
        assertTrue(flags.contains("Deadline Missed"),
                "Student who missed all deadlines should have 'Deadline Missed' flag, got: " + flags);
    }

    @Test
    @DisplayName("Speed-runner student should trigger Speed-runner flag")
    void speedRunnerShouldTriggerFlag() {
        LocalDateTime now = LocalDateTime.now();
        List<QuizSubmission> submissions = List.of(
                createSubmission(quizWithDeadline, watchStudent, now.minusDays(4), 70, 100, 1, true, 30),
                createSubmission(quizWithDeadline, watchStudent, now.minusDays(3), 65, 100, 1, true, 20)
        );

        when(quizSubmissionRepository.findByStudentOrderBySubmissionDateAsc(watchStudent))
                .thenReturn(submissions);

        Map<String, Object> result = analyticsService.calculateStudentRisk(watchStudent);

        List<?> flags = (List<?>) result.get("behavioralFlags");
        assertTrue(flags.contains("Speed-runner"),
                "Student who completes quizzes in under 60 seconds should have 'Speed-runner' flag, got: " + flags);
    }

    /**
     * Helper method to create a QuizSubmission with all necessary fields populated.
     */
    private QuizSubmission createSubmission(Quiz quiz, User student, LocalDateTime submitDate,
                                             int score, int maxScore, int attempt, boolean openedResource, long timeSpentSecs) {
        QuizSubmission sub = new QuizSubmission();
        sub.setQuiz(quiz);
        sub.setStudent(student);
        sub.setSubmissionDate(submitDate);
        sub.setStartTime(submitDate.minusSeconds(timeSpentSecs));
        sub.setStatus("GRADED");
        sub.setScore(score);
        sub.setMaxScore(maxScore);
        sub.setAttemptNumber(attempt);
        sub.setResourceOpened(openedResource);
        sub.setAnswerText("Test answer");
        return sub;
    }
}
