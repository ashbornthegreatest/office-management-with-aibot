# NeuroWork - AI Workload Intelligence Dashboard

## Overview
NeuroWork is an AI-powered organizational management system designed to optimize workload distribution, prevent employee burnout, and facilitate fair task assignment. It acts as a "Central Nervous System" for a company, using the Gemini API to analyze employee capacity, project health, and financial data in real-time.

## Features
- **AI Assistant**: Real-time workload analysis using Google Gemini API.
- **Task Management**: Mandatory and Voluntary task distribution logic.
- **Team Projects**: Squad-based project recruitment and tracking.
- **Product Dashboard**: Detailed analytics for company products (Profit, Traffic, Costs).
- **AI Strategic Analysis**: Individual product predictions and company-wide financial forecasting.
- **Developer Zone**: Track bugs, server logs, and developer comments.
- **Persistence**: All data is saved locally to your browser's LocalStorage.

---

## 🚀 How to Run Locally

Follow these steps to get the application running on your machine.

### 1. Prerequisites
Before starting, ensure you have the following installed:
- **Node.js** (Version 18 or higher recommended). [Download Here](https://nodejs.org/)
- **NPM** (Included with Node.js) or **Yarn**.

### 2. Get Your AI API Key
This application requires a Google Gemini API key to function (for the Chat and Analysis features).
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **"Get API key"**.
3. Create a key in a new or existing project.
4. Copy the key string (it starts with `AIza...`).

### 3. Installation & Setup

**Step A: Clone or Download**
Clone this repository or download the source code to a folder on your computer.
```bash
git clone <repository-url>
cd neurowork
```

**Step B: Install Dependencies**
Open your terminal/command prompt in the project folder and run:
```bash
npm install
```

**Step C: Configure Environment Variables**
1. Create a new file in the root of the project named `.env`.
2. Open the file and add your API key like this:
```env
API_KEY=your_actual_api_key_here
```
*(Note: Do not wrap the key in quotes. Just paste it directly after the equals sign).*

**Step D: Start the Server**
Run the development server:
```bash
npm start
```
*Note: Depending on your package manager/setup, this might be `npm run dev`.*

The application should automatically open in your browser at `http://localhost:1234` (or `http://localhost:5173` depending on the bundler).

---

## 🔑 Login Credentials

The system uses simulated authentication. Use these accounts to test different access levels:

### 👑 Founder & CEO (Admin Access)
*Can view all insights, edit any data, and sees the "God View" dashboard.*
- **Email:** `arshpreet@neurowork.ai`
- **Password:** `admin`

### 💼 Manager
*Can assign tasks and view team capacity, but cannot edit the CEO profile.*
- **Email:** `jessica@neurowork.ai`
- **Password:** `password123`

### 👨‍💻 Employee (Sarah Chen)
*Can only take "Open" tasks, update own progress, and edit own profile.*
- **Email:** `sarah@neurowork.ai`
- **Password:** `password123`

---

## 💡 User Guide

1.  **Dashboard Navigation**: Use the left sidebar to switch between the Task Board, Team Projects, Product Analytics, and Company Stats.
2.  **AI Assistant**: Click the **Floating Robot Icon** (bottom right) to open the AI panel. You can ask questions like "Who is overloaded?" or click "Analyze Organization" to generate a report.
3.  **Company Stats**: Go to the "Company Stats" view and click **"Run Global Analysis"**. The AI will read data from all products and generate a financial health report.
4.  **Task Management**:
    *   **Open Tasks**: Employees can click "Take Task" to add it to their workload.
    *   **Mandatory Tasks**: Managers assign these. They are locked for employees.
5.  **Profiles**: Click your avatar (top right) or any user in the "Team Capacity" view to see their profile, workload score, and history.

## Troubleshooting

-   **AI Not Responding?**
    -   Check your `.env` file. Ensure `API_KEY` is spelled correctly.
    -   Ensure you have internet access.
    -   Check the browser console (F12) for error messages related to 401 (Unauthorized) or 429 (Quota Exceeded).

-   **Changes Not Saving?**
    -   The app uses `localStorage`. If you clear your browser cache, data resets to default.
    -   You can hard reset data by going to **Settings > Reset All Data**.

-   **"Process is not defined" error?**
    -   This app requires a bundler (like Parcel, Vite, or Webpack) to inject the environment variables. Ensure you are running it via `npm start` and not just opening `index.html` directly in the browser.
