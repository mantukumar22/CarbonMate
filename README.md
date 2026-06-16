# CarbonMate 🌿

CarbonMate is an interactive, full-stack personal carbon footprints tracker designed to simplify eco-consciousness. With the help of its companion assistant **EcoBuddy**, users can log their day-to-day actions in plain natural language (e.g., commute distance, meals, AC hours, plastic waste) and immediately receive accurate pollution scorecards, intuitive environmental impact insights, and actionable, personalized eco-tips.

---

## 🎨 Visual Identity & Key Themes

CarbonMate leverages a clean, modern display layout built on:
- **Forest Obsidian Aesthetic**: Warm, deeply dark eye-safe background tones (`#121714` and `#1B2119`) paired with soft organic text accents (`#A8B8AA`) and vibrant plant-greens (`#10B981`).
- **Interactive EcoBuddy Helper**: Features animated reactive state highlights, including smooth green-border transitions, animated progress trackers, and real-time tree-offset conversion benchmarks.
- **Fail-Safe Carbon Math**: Includes an engineered dual-engine architecture. If the AI model is sleeping or times out (8 seconds), a fully compliant, natural-language parsing local client calculator immediately handles the scores silently—ensuring the user's scorecards are saved and displayed without error.

---

## 🚀 Key Features

- **Natural Language Chat Logs**: Just type how you traveled, what you ate, whether you used the AC, or if you recycled plastic bottles. The system extracts the specific data and estimates CO2 output.
- **Durable Persistence**: Logs are preserved across user sessions.
- **Smart Ecological Benchmarks**: Translates raw carbon metrics (kg CO2) into meaningful daily tree absorption equivalent equivalents, helping prioritize actions.
- **Dynamic Visual Analytics**: Visually represents trends, high-impact categories (Food vs. Travel vs. Utilities), and historical logs over time under a cohesive graphic interface.
- **Micro-Animations & Highlight Cues**: Flashes newly recorded tracker values smoothly in the local logs list to give instant validation feedback upon submitting logs.

---

## 💻 Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, and `motion` (Framer) for fluid route transitions.
- **Background Backend**: Express framework configured with `tsx` (Dev) and `esbuild` for structured production-ready server bundling (`dist/server.cjs`).
- **Persistence**: Google Firestore & Firebase Authentication rules schema.
- **AI Integration**: Server-Side `@google/genai` TypeScript SDK utilizing the modern `gemini-3.5-flash` model.

---

## 📂 Project Structure

```bash
├── server.ts                 # Full-stack Node/Express server entry point
├── src/
│   ├── App.tsx               # Primary React Layout route supervisor
│   ├── main.tsx              # React launch entry point
│   ├── types.ts              # Global standard TypeScript definitions
│   ├── index.css             # Tailwind setup, custom smooth scroll, & highlights
│   ├── components/           
│   │   ├── ChatLogger.tsx    # Natural language submission container with smooth autoscrolling
│   │   ├── EcoBuddy.tsx      # Interactive widget presenting response emotional feedback
│   │   ├── ImpactCard.tsx    # Atomic component for pollution categories
│   │   └── GraphicAssets.tsx # High-contrast loaders and illustrative assets
│   └── lib/
│       ├── gemini.ts         # Server-side model extraction routes proxy
│       └── emissionFactors.ts# Standardized environmental calculations indices
├── vite.config.ts            # Vite client config
├── package.json              # Dependency and lifecycle management script
└── .env.example              # Schema configuration for environment variables
```

---

## 🛠️ Local Development & Installation

Follow these steps to run CarbonMate locally:

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory and define the following:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```
The server will boot and serve the client on `http://localhost:3000`.

### 4. Build for Production
To generate optimized production client assets and bundle the server into a CJS file:
```bash
npm run build
npm start
```
