# 👁️ Forsight: Predictive Learning Analytics Dashboard

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Forsight+Dashboard)

**Forsight** is an AI-powered predictive analytics dashboard designed to shift education from reactive grading to proactive intervention. Built for the EdTech Learning Analytics hackathon, Forsight analyzes behavioral telemetry to identify at-risk students *before* their grades drop.

## 🏆 The Problem We Solve
70% of at-risk students display behavioral drop-offs weeks before their grades slip. Existing platforms only report the past. They do not predict the future. Forsight solves this by tracking how students interact with the material, not just what they score.

## ✨ Core Features
1. **Predictive Heuristics Engine**: Computes a real-time Risk Score (0-100) using weighted factors (Grade Drop, Missed Deadlines, Time Variance, Resource Skipping).
2. **Groq AI Interventions**: Generates personalized, one-sentence intervention strategies when a student crosses the risk threshold.
3. **Behavioral Flags**: Identifies specific student patterns like "Speed-Runner" or "Resource Skipper".
4. **Parent-Teacher Localization**: Translates AI insights into native languages (e.g., Bengali) for inclusive parent communication.
5. **Smart Document Assistant**: AI-powered study companion that helps students engage deeply with uploaded PDFs.

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts. Features a custom "Neubrutalist" design system.
- **Backend**: Spring Boot 3.2, Java 17, Spring Security + JWT, Spring Data JPA.
- **Database**: PostgreSQL (Supabase).
- **AI Integration**: Groq API (Llama-3.1-70b-versatile).

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- Java 17
- PostgreSQL Database
- Groq API Key

### Backend Setup
1. Navigate to `backend/`
2. Create `.env` based on `.env.example` and add your database credentials and `GROQ_API_KEY`.
3. Run the Spring Boot application: `./mvnw spring-boot:run`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run the Vite dev server: `npm run dev`

### Demo Accounts (Auto-seeded)
- **Teacher/Judge**: `judge@forsight.com` / `judge123`
- **Admin**: `admin@forsight.com` / `admin123`
- **Student**: `sara@forsight.com` / `student123`

## 📊 The Analytics Architecture
Forsight goes beyond basic charting. It calculates an Engagement Radar and Cohort Comparison using real-world heuristic data:
- **Participation**: Number of quizzes attempted.
- **Resource Study**: Whether the student opened the reference material before attempting the quiz.
- **Persistence**: Retries and attempt iterations.
- **Time Invested**: Time delta between quiz start and submission.

---
*Built with ❤️ for the EdTech Hackathon 2026*
