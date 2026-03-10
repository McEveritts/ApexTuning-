# ApexTuning 🏎️🤖

**ApexTuning** is a specialized, open-source React SPA designed to calculate highly competitive, mathematically sound tuning setups for Forza Horizon using the **Google Gemini 3.1 Pro** AI engine.

Unlike standard static tuning calculators, ApexTuning leverages an advanced **V2 Dynamic Scaling Protocol** to ingest your telemetry and output decimal-perfect physics calculations based strictly on your car's weight distribution, specific disciplines, and live community meta.

![ApexTuning UI](https://placehold.co/800x400/0F172A/F9AB00?text=ApexTuning+Interface)

---

## ⚡ Key Features

* **V2 Dynamic Scaling Protocol:** The core logic engine strictly forbids static ranges. Instead of defaulting to \"28 PSI,\" the AI calculates pressure and geometry formulas proportionally against the car's weight distribution and Forza's `(Max - Min)` slider boundaries.
* **Gemini 3.1 Pro Integration:** Natively interfaces with Google's Generative Language API, supporting bleeding-edge reasoning models (Pro/Deep Think) to handle complex telemetry offsets.
* **Search Grounding Security:** The API fetch payload explicitly enables Google Search Grounding. The AI queries live Forza community tuning meta and validates base vehicle stats before returning math, eliminating real-world automotive hallucinations.
* **Strict JSON Output:** The architecture forces `responseMimeType: "application/json"`. Conversational text is stripped out entirely, guaranteeing perfectly mapped, destructured React state updates every time.
* **V3 GenUI Architecture:** A comprehensive suite of power-user tools including data visualizations, shareable tuning links, a PNG/PDF export engine, multi-car comparison UI, and local caching for favorite tunes.

## 🚀 Getting Started

ApexTuning is built for extreme performance. It uses a custom **Vanilla CSS Design System (Slate & Gold)** to eliminate massive UI library dependencies like MUI or Tailwind.

### Prerequisites

* Node.js (v18+)
* A [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/ApexTuning.git
    cd ApexTuning
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Configure API Key**
    The app uses a strict UI-bound `localStorage` layer to store your key securely, but for local deployment, create a `.env.local` file:

    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4. **Launch the App**

    ```bash
    npm run dev
    ```

## 🛠️ Tech Stack & Architecture

* **Frontend Framework:** React + Vite
* **State Management:** React Hooks (`useState`, `useEffect`) binding Input & Output components cleanly to prevent chained re-renders.
* **Styling:** Custom Vanilla CSS Grid + Flexbox (`index.css`), governed by CSS Custom Properties (`--bg-slate-primary`, `--accent-gold`).
* **AI Backend Strategy:** Stateless `fetch` injection inside `src/services/geminiApi.js` utilizing the `systemInstruction` array to embed the entire 12-Phase physics protocol.

## 🤝 Contributing & Community Standards

We enforce a strict aesthetic and architectural standard to maintain minimum bundle size and layout predictability. If you want to contribute, you **must** read our [Contributing Guidelines](CONTRIBUTING.md) and use the provided PR template.

**Summary of standards:**

* No hardcoded CSS Hex Codes; use global palette variables.
* Do not remove the Google Search Grounding `tools` array from `geminiApi.js`.
* Pass the "Giulia Mock Data" test before submitting a PR.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
