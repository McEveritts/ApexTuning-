## Description

## Related Issue

## 📋 Pre-Flight Audit Checklist

### Security & State

- [ ] I have verified that no API keys, `.env` files, or sensitive data are included in this commit.
- [ ] My changes do not introduce unnecessary React re-renders or infinite state loops.
- [ ] The submit button correctly disables while the Gemini API is processing (`isLoading` state).

### UI/UX & Design System

- [ ] I have exclusively used the global CSS variables (`--bg-slate-primary`, `--accent-gold`) and have not hardcoded new hex colors.
- [ ] The UI layout remains responsive on mobile devices and gracefully handles dense JSON tuning outputs.
- [ ] If I added new text, it utilizes the `Roboto` font family.

### AI & API Integrity (If modifying `geminiApi.js`)

- [ ] The `responseMimeType: "application/json"` constraint remains intact.
- [ ] The Google Search Grounding tool array has not been removed or bypassed.
- [ ] I have verified that the Gemini 3.1 model still strictly adheres to the **V2 Dynamic Scaling Protocol** and does not hallucinate real-world car data.

### 🧪 Required Testing

- [ ] **The Giulia Test:** I have successfully rendered a test payload using the 2018 Alfa Romeo Giulia mock data (3359 lbs, 50/50 distribution) and confirmed the UI does not break.
- [ ] I have run `npm run build` locally and it completed with zero errors.

## Screenshots / Screen Recordings (If applicable)
