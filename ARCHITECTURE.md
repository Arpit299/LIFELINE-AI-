# 🏛️ LIFELINE AI — Software Architecture & Algorithmic Designs

This document provides a detailed breakdown of the technical decisions, API structures, data flows, and algorithmic boundaries underpinning **LIFELINE AI**.

---

## 🧭 Architectural Diagram

```
                       +----------------------------------+
                       |        React 18 SPA (Vite)       |
                       |  - Tailwind CSS v4 & Motion 12   |
                       |  - State Management via Zustand  |
                       +----------------------------------+
                                        |
                 +----------------------+----------------------+
                 | (REST API Calls)                            | (Real-time Synced Data)
                 v                                             v
+----------------------------------+          +----------------------------------+
|      Express Backend Proxy       |          |        Firebase Services         |
|   - lazy init @google/genai      |          |   - Firebase Firestore DB        |
|   - Gemini 1.5/2.5 Flash & Pro   |          |   - Firebase Authentication      |
+----------------------------------+          +----------------------------------+
```

---

## 🧪 Algorithmic Focus: The Lifeline Score™

To determine priority, guessing is replaced with a strict deterministic calculation:

$$score = (W_u \times T_p) + (I_w \times B_f)$$

### 1. Variables Definition
* **$W_u$ (Urgency Weight)**: Fixed at **60**, assigning maximum temporal weight to deadlines.
* **$T_p$ (Time Pressure)**: Represents the immediate urgency.
  $$T_p = 1 - \frac{hours\_remaining}{total\_hours}$$
  * $hours\_remaining$ is computed dynamically against `Date.now()`.
  * $total\_hours$ is set to **168** (a standard 7-day planning horizon).
  * If $hours\_remaining \le 0$ (overdue), $T_p$ is capped at **1.0**.
* **$I_w$ (Impact Weight)**: Extracted from user inputs ($1$ to $5$ scale) and multiplied by **6** to scale it to a max score of **30** base impact.
* **$B_f$ (Blocking Factor)**: Tracks cascading blockages across the task tree.
  $$B_f = 1 + (0.25 \times blocked\_tasks\_count)$$
  * $blocked\_tasks\_count$ is the total count of active tasks listing this task's ID as a dependency. This ensures that root-blocking items automatically scale in pressure.

---

## 🤖 AI Prompts & Gemini Orchester Chains

The application runs 4 distinct prompt chains handled securely by the Express server proxy:

### Chain 1: Urgency Analyzer (Flash)
Calculates and audits task scope, context, and deadline constraints, returning clean structural JSON containing:
* `urgency_score`: Recommended AI priority (0-100).
* `reasoning`: Detailed high-level breakdown.
* `blockers`: roadmaps or dependency alerts.
* `next_action`: lowest physical boundary step.

### Chain 2: Bulk Task Parser (Flash)
Extracts individual actions from raw mess, returning a typed array of structured tasks.

### Chain 3: Weekly Plan Generator (Pro)
Invokes **Gemini 1.5 Pro**'s high reasoning capabilities to schedule task loads day-by-day.

### Chain 4: Focus Mode Coach (Flash)
Deconstructs a single target into Pomodoro-sized tasks, paired with motivational coaching.

---

## 🔒 Security Posture & Rules

1. **Server-Side API Key Concealment**: Never load `GEMINI_API_KEY` into client bundles. The Express server serves as a strict gateway.
2. **Firestore Security Principles**:
   * All rules must enforce authentication: `request.auth != null`.
   * Write transactions must assert that `request.auth.uid == resource.data.userId` to prevent cross-account modification or leaks.
