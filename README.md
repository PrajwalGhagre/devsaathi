# DevSaathi AI

An AI-powered coding tutor, code explanation tool, and debugging assistant for developers.

## Features

- **Explain Code** — Paste any code snippet in JS, Python, Java, C++, C#, Go, Rust, SQL and get a structured explanation with key concepts and line-by-line breakdown.
- **AI Debugger** — Share buggy code + error message → get root-cause analysis, corrected code, and prevention tips.
- **Learn Mode** — Enter any concept (closures, async/await, Big O) at Beginner/Intermediate/Advanced level, with examples and an interactive quiz.
- **Smart Action Plan** — Context-aware next steps after every AI operation.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Connecting a Real AI

1. Copy `.env.example` → `.env.local`
2. Set `VITE_AI_API_URL` to your OpenAI-compatible endpoint
3. Set `VITE_AI_API_KEY` to your API key
4. The app exits Demo Mode automatically

> ⚠️ In production, **proxy API calls through a backend** — never expose API keys in frontend bundles.

## Build

```bash
npm run build   # Production build to dist/
npm run preview # Preview the production build locally
```

## Deploy

The `dist/` folder is a static site — deploy to Vercel, Netlify, or GitHub Pages:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --dir=dist --prod
```

## Project Structure

```
src/
  components/
    ui.jsx            # Reusable design-system components
    Sidebar.jsx       # Navigation sidebar
    Header.jsx        # Top header bar
    SmartActionPlan.jsx  # Context-aware next steps
  pages/
    Dashboard.jsx     # Home / landing page
    ExplainCode.jsx   # Code explanation tool
    Debugger.jsx      # AI debugging tool
    LearnMode.jsx     # Interactive learning tool
  services/
    aiService.js      # AI abstraction (demo + real API)
  hooks/
    useClipboard.js   # Copy-to-clipboard hook
  App.jsx             # Router + layout shell
  main.jsx
  index.css
```
