package com.forsight.config;

import com.forsight.model.*;
import com.forsight.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private DocsConfigRepository docsConfigRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private QuizRepository quizRepository;
    @Autowired private QuizSubmissionRepository quizSubmissionRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User teacher = seedUsers();
        seedDocsConfig();
        
        // If we already have the demo student, assume data is seeded
        if (userRepository.existsByEmail("sara@forsight.com")) return;

        seedDemoData(teacher);
    }

    private User seedUsers() {
        // Teacher
        User judge = userRepository.findByEmail("judge@forsight.com").orElseGet(() -> {
            User u = new User();
            u.setName("Hackathon Judge");
            u.setEmail("judge@forsight.com");
            u.setPassword(passwordEncoder.encode("judge123"));
            u.setRole(Role.TEACHER);
            return userRepository.save(u);
        });

        // Admin
        if (!userRepository.existsByEmail("admin@forsight.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@forsight.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }
        return judge;
    }

    private void seedDocsConfig() {
        docsConfigRepository.deleteAll();
        
        if (!docsConfigRepository.existsById(1L)) {
            DocsConfig config = new DocsConfig();
            config.setId(1L);
            config.setPublic(true);
            config.setAvailableFrom(LocalDateTime.now().minusDays(1));
            config.setAvailableUntil(LocalDateTime.now().plusDays(10));
            String initialContent = "{" +
                    "\"problem\": \"The education system is fundamentally reactive. By the time a student fails a midterm, it's already too late.\\n\\n- **Hidden Failure:** 70% of at-risk students display behavioral drop-offs weeks before their grades slip, completely undetected.\\n- **Data Paralysis:** Teachers are overwhelmed by fragmented LMS data, making proactive intervention impossible.\\n- **Static Dashboards:** Existing platforms only report the past. They do not predict the future.\"," +
                    "\"solution\": \"Forsight shifts education from reactive to **predictive**. We don't just track grades; we track behavior.\\n\\n- **Predictive Heuristics Engine:** We aggregate real-time telemetry (time-variance, resource skipping) into a live 0-100 Risk Score.\\n- **Groq AI Interventions:** When a risk threshold is breached, our engine uses Groq's ultra-fast LLM to generate a personalized, single-sentence intervention strategy.\\n- **Actionable Triage:** Teachers get a prioritized list, empowering them to save students *before* they fail.\"," +
                    "\"market\": \"The global EdTech market hits **$404B by 2025**, but *Predictive Learning Analytics* is exploding at a 25.4% CAGR. We target the most urgent metric: student retention. A mere 5% increase in retention boosts university revenue by millions annually.\"," +
                    "\"businessModel\": \"**B2B SaaS & API Licensing**\\n\\n- **Tier 1 (Institutions):** Base dashboard licensing billed per active student/month.\\n- **Tier 2 (Enterprise LMS):** White-labeled API integration allowing existing giants (Canvas, Blackboard) to plug into our Groq-powered risk engine.\"," +
                    "\"techDocs\": \"### Technology Stack\\n\\n- **Frontend:** React, Vite, TailwindCSS\\n- **Backend:** Spring Boot, PostgreSQL\\n- **AI Engine:** Groq API\\n\\n### Core APIs\\n\\n- `GET /api/analytics/teacher/students` - Returns risk scores\\n- `POST /api/ai/intervention` - Generates strategy\\n- `GET /api/docs/public` - Returns documentation payload\"," +
                    "\"team\": [" +
                    "  {\"name\": \"Israt Jahan Eshita\", \"role\": \"Lead Full-Stack Architect\", \"email\": \"isratjahan.0244@gmail.com\", \"imageUrl\": \"/female_vector.png\"}," +
                    "  {\"name\": \"Kazi Shahid Ahmed\", \"role\": \"Product Manager\", \"email\": \"shahid93cs@gmail.com\", \"imageUrl\": \"/male_vector.png\"}," +
                    "  {\"name\": \"Adnan Kader Mitul\", \"role\": \"Systems Analyst\", \"email\": \"adnan.cse.20220204102@aust.edu\", \"imageUrl\": \"/male_vector.png\"}" +
                    "]}";
            config.setContentJson(initialContent);
            docsConfigRepository.save(config);
        }
    }

    private void seedDemoData(User teacher) {
        // Create Students
        User s1 = createStudent("Sara Rahman", "sara@forsight.com");
        User s2 = createStudent("Vikram Das", "vikram@forsight.com"); // High Risk
        User s3 = createStudent("Aarav Patel", "aarav@forsight.com");
        User s4 = createStudent("Neha Gupta", "neha@forsight.com");
        User s5 = createStudent("Rohan Sharma", "rohan@forsight.com");

        // Generate sample PDF content so preview and AI extraction always work
        byte[] physicsPdf = generateSamplePdf("Kinematics Study Guide",
                "Chapter 1: Motion in One Dimension\n\n" +
                "Kinematics is the branch of mechanics that describes the motion of objects without considering the forces that cause them.\n\n" +
                "Key Equations:\n" +
                "1. v = u + at (Final velocity)\n" +
                "2. s = ut + (1/2)at^2 (Displacement)\n" +
                "3. v^2 = u^2 + 2as (Velocity-displacement relation)\n\n" +
                "Where:\n" +
                "- u = initial velocity (m/s)\n" +
                "- v = final velocity (m/s)\n" +
                "- a = acceleration (m/s^2)\n" +
                "- t = time (s)\n" +
                "- s = displacement (m)\n\n" +
                "Example: A ball is dropped from rest (u=0) under gravity (a=9.8 m/s^2) for 5 seconds.\n" +
                "Final velocity: v = 0 + 9.8 x 5 = 49 m/s\n" +
                "Distance fallen: s = 0 + 0.5 x 9.8 x 25 = 122.5 m");

        byte[] calculusPdf = generateSamplePdf("Calculus Notes",
                "Chapter 1: Derivatives\n\n" +
                "The derivative of a function measures the rate of change of the function with respect to its variable.\n\n" +
                "Basic Rules:\n" +
                "1. Power Rule: d/dx [x^n] = n*x^(n-1)\n" +
                "2. Sum Rule: d/dx [f(x) + g(x)] = f'(x) + g'(x)\n" +
                "3. Product Rule: d/dx [f(x)*g(x)] = f'(x)*g(x) + f(x)*g'(x)\n" +
                "4. Chain Rule: d/dx [f(g(x))] = f'(g(x)) * g'(x)\n\n" +
                "Example: Find the derivative of 3x^2 + 2x\n" +
                "Using the power rule: d/dx [3x^2] = 6x, d/dx [2x] = 2\n" +
                "Answer: 6x + 2");

        // Courses
        Course c1 = new Course(null, "Physics Fundamentals", "Core physics concepts", "Class 10", teacher);
        Course c2 = new Course(null, "Advanced Mathematics", "Calculus and Algebra", "Class 10", teacher);
        courseRepository.saveAll(List.of(c1, c2));

        // Enrollments
        for (User s : List.of(s1, s2, s3, s4, s5)) {
            String c1Status = "Enrolled";
            String c2Status = "Enrolled";
            
            // Make the dossiers look dynamic
            if (s.getEmail().equals("vikram@forsight.com")) {
                c1Status = "Needs Review"; // Triggers the yellow warning badge
            }
            if (s.getEmail().equals("neha@forsight.com")) {
                c2Status = "Pending"; // Triggers pending state
            }
            
            enrollmentRepository.save(new Enrollment(s, teacher, c1, c1Status, LocalDateTime.now().minusDays(30)));
            enrollmentRepository.save(new Enrollment(s, teacher, c2, c2Status, LocalDateTime.now().minusDays(30)));
        }

        // Resources with embedded PDF data
        Resource r1 = Resource.builder()
                .title("Kinematics PDF").description("Complete study guide covering motion equations and kinematic analysis")
                .fileName("kinematics.pdf").fileType("application/pdf")
                .teacher(teacher).course(c1).uploadDate(LocalDateTime.now())
                .build();
        r1.setFileData(physicsPdf);

        Resource r2 = Resource.builder()
                .title("Calculus Notes").description("Comprehensive notes on derivatives and differentiation rules")
                .fileName("calc.pdf").fileType("application/pdf")
                .teacher(teacher).course(c2).uploadDate(LocalDateTime.now())
                .build();
        r2.setFileData(calculusPdf);

        resourceRepository.saveAll(List.of(r1, r2));

        // Quizzes with due dates
        LocalDateTime today = LocalDateTime.now();

        Quiz q1 = Quiz.builder()
                .title("Kinematics Quiz 1").description("Basic motion")
                .teacher(teacher).resource(r1).createdDate(today.minusDays(7))
                .dueDate(today.minusDays(4))
                .build();
        Quiz q2 = Quiz.builder()
                .title("Kinematics Quiz 2").description("Advanced motion")
                .teacher(teacher).resource(r1).createdDate(today.minusDays(4))
                .dueDate(today.minusDays(1))
                .build();
        Quiz q3 = Quiz.builder()
                .title("Calculus Midterm").description("Derivatives")
                .teacher(teacher).resource(r2).createdDate(today.minusDays(3))
                .dueDate(today.plusDays(1))
                .build();
        quizRepository.saveAll(List.of(q1, q2, q3));

        // Submissions to generate trend & risk data
        
        // Sara (Safe - High Engagement, Good Scores, On Time)
        addSubmission(q1, s1, today.minusDays(5), 95, 100, 1, true, 3600, "GRADED");
        addSubmission(q2, s1, today.minusDays(2), 92, 100, 1, true, 4000, "GRADED");
        addSubmission(q3, s1, today.minusDays(1), 98, 100, 1, true, 4500, "GRADED");

        // Vikram (Critical - Falling grades, skipping resources, speed-running, LATE submissions)
        // All submissions are late, skipped resources, speedruns (<60s), with multiple fails and massive grade drops.
        addSubmission(q1, s2, today.minusDays(3), 85, 100, 1, false, 30, "GRADED");      // Late (due minusDays(4)), speedrun, skip resource
        addSubmission(q2, s2, today, 80, 100, 2, false, 30, "GRADED");                   // Late (due minusDays(1)), speedrun, skip resource, fail
        addSubmission(q3, s2, today.plusDays(3), 20, 100, 2, false, 30, "PENDING");      // Massive drop (80->20), Late, speedrun, skip resource, fail

        // Aarav (Watch - Average but struggling slightly)
        addSubmission(q1, s3, today.minusDays(5), 75, 100, 1, true, 3000, "GRADED");
        addSubmission(q2, s3, today, 50, 100, 1, true, 3500, "GRADED"); // Late (due minusDays(1)), Grade drop (75->50 = 25*2=50% drop)
        
        // Neha (Safe - Improving)
        addSubmission(q1, s4, today.minusDays(6), 65, 100, 1, true, 4000, "GRADED");
        addSubmission(q2, s4, today.minusDays(3), 85, 100, 1, true, 3800, "PENDING"); // Needs Review
        addSubmission(q3, s4, today.minusDays(0), 90, 100, 1, true, 4200, "GRADED");

        // Rohan (Safe)
        addSubmission(q1, s5, today.minusDays(5), 88, 100, 1, true, 3200, "GRADED");
        addSubmission(q2, s5, today.minusDays(4), 85, 100, 1, true, 3100, "GRADED");
        
        System.out.println("Seeded realistic hackathon demo data with embedded PDFs.");
    }

    /**
     * Programmatically generates a simple PDF document using Apache PDFBox.
     * This ensures the demo always has working preview and AI text extraction.
     */
    private byte[] generateSamplePdf(String title, String content) {
        try {
            org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument();
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            document.addPage(page);

            org.apache.pdfbox.pdmodel.PDPageContentStream contentStream =
                    new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page);

            // Title
            contentStream.beginText();
            contentStream.setFont(new org.apache.pdfbox.pdmodel.font.PDType1Font(org.apache.pdfbox.pdmodel.font.Standard14Fonts.FontName.HELVETICA_BOLD), 18);
            contentStream.newLineAtOffset(50, 750);
            contentStream.showText(title);
            contentStream.endText();

            // Body content - split into lines
            contentStream.beginText();
            contentStream.setFont(new org.apache.pdfbox.pdmodel.font.PDType1Font(org.apache.pdfbox.pdmodel.font.Standard14Fonts.FontName.HELVETICA), 11);
            contentStream.setLeading(16f);
            contentStream.newLineAtOffset(50, 720);

            for (String line : content.split("\n")) {
                if (line.length() > 90) {
                    // Word wrap long lines
                    String[] words = line.split(" ");
                    StringBuilder currentLine = new StringBuilder();
                    for (String word : words) {
                        if (currentLine.length() + word.length() > 90) {
                            contentStream.showText(currentLine.toString().trim());
                            contentStream.newLine();
                            currentLine = new StringBuilder();
                        }
                        currentLine.append(word).append(" ");
                    }
                    if (currentLine.length() > 0) {
                        contentStream.showText(currentLine.toString().trim());
                        contentStream.newLine();
                    }
                } else {
                    contentStream.showText(line);
                    contentStream.newLine();
                }
            }
            contentStream.endText();
            contentStream.close();

            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            document.save(baos);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("Failed to generate sample PDF: " + e.getMessage());
            return new byte[0];
        }
    }

    private User createStudent(String name, String email) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode("student123"));
            u.setRole(Role.STUDENT);
            return userRepository.save(u);
        });
    }

    private void addSubmission(Quiz q, User s, LocalDateTime submitDate, Integer score, Integer max, int attempt, boolean openedRes, long timeSpentSecs, String status) {
        QuizSubmission sub = new QuizSubmission();
        sub.setQuiz(q);
        sub.setStudent(s);
        sub.setSubmissionDate(submitDate);
        sub.setStartTime(submitDate.minusSeconds(timeSpentSecs));
        sub.setStatus(status);
        sub.setScore(score);
        sub.setMaxScore(max);
        sub.setAttemptNumber(attempt);
        sub.setResourceOpened(openedRes);
        String realisticAnswer;
        if (q.getTitle().contains("Kinematics")) {
            realisticAnswer = score > 80 ? 
                "The object's final velocity is calculated using v = u + at. Given u=0, a=9.8, t=5, the velocity is 49 m/s." : 
                "I used the formula v = d/t, but I think I messed up the acceleration part. Answer is 25 m/s.";
        } else {
            realisticAnswer = score > 80 ? 
                "By applying the power rule, the derivative of 3x^2 + 2x is 6x + 2." : 
                "Derivative is 3x. I forgot how to do the exponent rule.";
        }
        sub.setAnswerText(realisticAnswer);
        quizSubmissionRepository.save(sub);
    }
}
