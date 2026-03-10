# Contributing to ApexTuning 🏎️🤖

First off, thank you for considering contributing to ApexTuning! Our goal is to build the most mathematically accurate, AI-powered tuning assistant for the Forza Horizon community.

To ensure the app remains blazing fast, secure, and visually consistent, please review our architecture and contribution guidelines below.

## 🏗️ Architecture & Stack

ApexTuning is a Single Page Application (SPA) designed for speed and minimal overhead.

* **Frontend:** React + Vite
* **Styling:** Vanilla CSS (CSS Grid, Flexbox, native CSS Variables). *Note: We do not use Tailwind or component libraries like MUI. Keep dependencies light.*
* **AI Core:** Google Gemini 3.1 Pro via the Generative Language API.

## 🧠 The AI Engine: V2 Dynamic Scaling Protocol

ApexTuning does not use simple AI text generation. It relies on a strict, mathematically enforced prompt structure called the **V2 Dynamic Scaling Protocol**.

* If you are modifying `src/services/geminiApi.js`, you **must** ensure that the AI continues to use the proportional tuning equation: `(Max Slider - Min Slider) * Weight Distribution + Min Slider`.
* **Search Grounding:** The Gemini 3.1 API is configured to use Google Search to fetch live Forza community meta and verify base car stats. Do not remove this `tools` array from the fetch payload.
* **JSON Strictness:** The app expects a rigid JSON schema response. Any prompt modifications must guarantee the model does not return conversational text that could break the React state.

## 🎨 Design System: Slate & Gold

We enforce a strict, high-performance automotive aesthetic. Do not use hardcoded hex values in your component files. Always use the global CSS variables defined in `index.css`:

* Primary Background: `var(--bg-slate-primary)`
* Component Cards: `var(--bg-slate-secondary)`
* Accents/CTA: `var(--accent-gold)`
* Font: `Roboto` (Google Fonts)

## 💻 Local Development Setup

1. Fork and clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your test API key:

   ```env
   VITE_GEMINI_API_KEY=your_dev_key_here
   ```

   *Note: Our `.gitignore` prevents `.env` files from being committed. Never commit your personal API key.*

4. Start the Vite development server:

   ```bash
   npm run dev
   ```

## 🚀 Pull Request Process

1. Create a feature branch (`git checkout -b feature/amazing-new-thing`).
2. Ensure your code passes the linter and Vite production build test (`npm run lint` && `npm run build`).
3. Commit your changes with descriptive messages.
4. Push to your branch and open a Pull Request against the main branch.
5. You must fill out the Pull Request Template provided.
