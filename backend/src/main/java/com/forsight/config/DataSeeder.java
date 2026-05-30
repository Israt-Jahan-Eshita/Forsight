package com.forsight.config;

import com.forsight.model.DocsConfig;
import com.forsight.model.Role;
import com.forsight.model.User;
import com.forsight.repository.DocsConfigRepository;
import com.forsight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocsConfigRepository docsConfigRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Judge Account
        if (!userRepository.existsByEmail("judge@forsight.com")) {
            User judge = new User();
            judge.setName("Hackathon Judge");
            judge.setEmail("judge@forsight.com");
            judge.setPassword(passwordEncoder.encode("judge123"));
            judge.setRole(Role.TEACHER);
            userRepository.save(judge);
            System.out.println("Seeded Judge Account: judge@forsight.com / judge123");
        }

        // Seed Admin Account
        if (!userRepository.existsByEmail("admin@forsight.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@forsight.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Seeded Admin Account: admin@forsight.com / admin123");
        }

        // Force re-seed for Hackathon Data
        docsConfigRepository.deleteAll();
        
        // Seed DocsConfig
        if (!docsConfigRepository.existsById(1L)) {
            DocsConfig config = new DocsConfig();
            config.setId(1L);
            config.setPublic(true);
            config.setAvailableFrom(LocalDateTime.now().minusDays(1)); // Active by default
            config.setAvailableUntil(LocalDateTime.now().plusDays(10));
            
            // Basic Initial JSON Payload
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
            System.out.println("Seeded default DocsConfig.");
        }
    }
}
