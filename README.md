# Forsight

**Live Deployment:** [https://forsight-app.onrender.com](https://forsight-app.onrender.com)

Forsight is an advanced educational telemetry platform designed to bridge the gap between passive learning management systems and proactive student success. By combining dynamic behavioral telemetry with a strict, hyper-contextual LLM tutor, Forsight empowers educators to identify at-risk students before they fail, while providing personalized, zero-hallucination academic support to students.

---

## Problem Statement

In modern education, learning management systems are fundamentally reactive. Teachers typically only realize a student is struggling after they have failed an exam or dropped out of a course. Concurrently, students lack access to personalized, 24/7 academic support that understands their specific curriculum, often relying on generic AI tools that hallucinate or provide irrelevant answers. There is a critical need for a unified system that simultaneously identifies systemic behavioral risk across a cohort while actively helping individuals study their exact course material.

## Solution Architecture

Forsight solves this systemic issue via a two-pronged approach:

1. **Predictive Risk Telemetry:** As students interact with the platform (viewing resources, completing quizzes, assignment latency), the backend continuously aggregates behavioral data. A deterministic heuristic engine calculates a dynamic "Risk Score" (0-100) for every student. This allows teachers and administrators to view a macro-level Risk Dashboard, identify systemic issues, and intervene structurally.
2. **Hyper-Contextual AI Tutor:** Forsight integrates with the Groq Cloud API for ultra-low latency LLM inference. When a student opens a study guide, the Java Spring Boot backend extracts the text directly from the PDF byte array and feeds it into the LLM as strict context. The AI acts as a dedicated tutor that only answers questions based on the teacher's exact curriculum, enforcing a strict zero-hallucination policy.

---

## Technical Stack

### Frontend
* **Framework:** React 18, Vite
* **Styling:** TailwindCSS (Custom Neumorphic Design System)
* **Icons:** Lucide React
* **Containerization:** Docker (Multi-stage build with Nginx)
* **Deployment:** Render

### Backend
* **Framework:** Java, Spring Boot 3
* **Security:** Spring Security, JWT (JSON Web Tokens), Role-Based Access Control (RBAC)
* **File Processing:** Apache PDFBox (In-memory unstructured text extraction)
* **Containerization:** Docker (Eclipse Temurin JRE)
* **Deployment:** Render Web Service

### Database & Storage
* **Relational Database:** PostgreSQL (Hosted on Supabase)
* **Storage Pattern:** Binary byte array (bytea) storage for dynamic multimedia streaming (PDF, MP4, MP3, PNG)

### AI & Data Pipeline
* **LLM:** Llama-3-8B-8192 (via Groq Cloud API)
* **Architecture:** Zero-shot Contextual RAG (Retrieval-Augmented Generation)

---

## Core Features

* **Real-time Telemetry Dashboards:** Distinct interactive dashboards for Teachers and Administrators displaying aggregated cohort risk levels and individual student metrics.
* **Context-Bound AI Chat:** An integrated conversational UI where students can ask questions about specific study materials. The LLM is strictly constrained via system prompting to reject out-of-scope queries.
* **Multimedia Streaming:** Native browser streaming for uploaded MP4 video and audio files directly from the database layer.
* **Automated Risk Scoring:** Hardcoded backend heuristics evaluate assignment latency and engagement variance to update risk profiles synchronously.
* **Role-Based Access Control (RBAC):** Strict data isolation ensuring students cannot access peer telemetry, and teachers can only access enrolled cohorts.

---

## Local Development Setup

To run this project locally, you will need Node.js, Java 17+, and a PostgreSQL database.

### 1. Database Configuration
Ensure you have a PostgreSQL instance running. Create a `.env` file in the `backend/` directory with the following properties:

```env
DB_URL=jdbc:postgresql://your-db-host:5432/your-db-name
DB_USERNAME=your_username
DB_PASSWORD=your_password
GROQ_API_KEY=your_groq_api_key
```

### 2. Backend Initialization
Navigate to the `backend/` directory and run the Spring Boot application using Maven wrapper:

```bash
cd backend
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8080`. The database schema will be automatically generated, and the DataSeeder will populate mock users and courses.

### 3. Frontend Initialization
Navigate to the `frontend/` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`. 

### 4. Authentication Details
The database seeder provisions three default accounts for immediate testing:
* **Teacher/Judge:** judge@forsight.com (Password: judge123)
* **Student:** sara@forsight.com (Password: student123)
* **Admin:** admin@forsight.com (Password: admin123)
