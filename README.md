# LIFELINE AI — Urgency and Deadline Intelligence System

> **Your AI co-pilot for deadlines. Know what matters. Do it now.**

LIFELINE AI is a production-grade, AI-powered task priority and deadline intelligence system designed for high-performing professionals. It solves task overwhelm by converting raw task chaos into a dynamically ranked, context-aware action plan using a proprietary Lifeline Score™ algorithm combined with Gemini 1.5 Pro and 1.5 Flash models.

---

## 🚀 Core Features

1. **Urgency Engine (Lifeline Score™)**: Calculates dynamic, real-time urgency metrics using time remaining, task impact, and blocking factors.
2. **AI Urgency Analyzer**: Streams context-aware priority recommendations, reasoning, and next actions directly from Gemini 1.5 Flash.
3. **Bulk Task Parser**: Employs Gemini 1.5 Flash to automatically dissect raw brain-dumps of copy-pasted tasks into structured schemas with deadlines and categories.
4. **Weekly Plan Generator**: Uses Gemini 1.5 Pro's advanced reasoning to synthesize tasks into optimal, hour-blocked schedules based on user working hours.
5. **Focus Mode Coach**: Combines a Pomodoro-style distraction-free UI with real-time audio/motivational coaching powered by Gemini.
6. **Voice Input Integration**: Dictate tasks instantly using native Web Speech API.
7. **Premium Dark Glassmorphism UI**: High-fidelity dark mode designed to decrease cognitive overload.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 6 + TailwindCSS 4 + Framer Motion 12
- **State & Router**: Zustand + React Router v6
- **Database & Auth**: Firebase Firestore + Firebase Auth (with automatic fallback to Demo Mode via `?demo=true`)
- **AI Backend**: `@google/genai` (Express backend proxy)
- **Visuals & Reports**: Recharts (interactive data visualization) + jsPDF (branded PDF exporting) + canvas-confetti

---

## 📋 Quick Start

To run the application locally in development:

```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack development server (Express + Vite)
npm run dev
```

The application runs on **http://localhost:3000**.
To experience the application without configuring external API keys or Firebase, launch with:
**http://localhost:3000/?demo=true**
