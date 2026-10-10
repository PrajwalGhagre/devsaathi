/**
 * DevSaathi AI — Frontend Service Layer
 *
 * This module calls the DevSaathi BACKEND PROXY, not the LLM provider directly.
 * No API keys ever live here — they belong in server/.env only.
 *
 * Mode detection:
 *   - The backend returns { _demo: true, ... } when running without credentials.
 *   - The frontend reads that flag and shows a "Demo Mode" indicator.
 *   - Real AI responses do NOT contain _demo.
 *
 * To run with real AI:
 *   1. Copy server/.env.example → server/.env
 *   2. Set AI_API_URL and AI_API_KEY in server/.env
 *   3. Start the backend:  cd server && npm run dev
 *   4. Start the frontend: npm run dev
 */

// Backend URL — safe to expose (it's just a URL, not a credential)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Request timeout for frontend fetch calls (matches backend timeout)
const FETCH_TIMEOUT_MS = 35_000;

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function post(endpoint, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out — the server took too long to respond.');
    }
    throw new Error(
      'Cannot reach the DevSaathi server. Make sure `cd server && npm run dev` is running.'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message = `Server error (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* response wasn't JSON */ }
    throw new Error(message);
  }

  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** @returns {{ _demo?: boolean, summary, keyConcepts, lineByLine, example, complexity }} */
export async function explainCode({ code, language }) {
  return post('/api/explain', { code, language });
}

/** @returns {{ _demo?: boolean, severity, probableCause, explanation, correctedCode, preventionTips }} */
export async function debugCode({ code, error, language }) {
  return post('/api/debug', { code, error, language });
}

/** @returns {{ _demo?: boolean, title, explanation, analogy, codeExample, keyTakeaways, quiz }} */
export async function learnConcept({ topic, difficulty }) {
  return post('/api/learn', { topic, difficulty });
}

/**
 * Check whether the backend is reachable and in what mode.
 * Returns null if the backend is offline.
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return res.json(); // { status, mode, timestamp }
  } catch {
    return null;
  }
}
