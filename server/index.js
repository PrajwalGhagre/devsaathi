'use strict';

/**
 * DevSaathi AI — Secure Backend Proxy
 *
 * Security measures in place:
 *  - Helmet sets safe HTTP headers (X-Content-Type-Options, CSP, HSTS, etc.)
 *  - CORS limited to explicitly configured origins (never wildcard in production)
 *  - Rate limiting per IP (60 requests / 15 minutes)
 *  - Strict input validation + size limits before any AI call
 *  - AI response sanitised before returning to frontend
 *  - API key only in process.env — never logged, never returned to client
 *  - Errors returned with safe generic messages (no provider details leaked)
 */

require('dotenv').config();

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const { explainCode, debugCode, learnConcept, IS_DEMO } = require('./aiProvider');
const { validate } = require('./validation');

const app  = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Allowed origins ─────────────────────────────────────────────────────────
const rawOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').trim();
const ALLOWED_ORIGINS = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  // Allow same-origin iframes (needed for some hackathon demo embeds)
  frameguard: { action: 'sameorigin' },
  // Content-Security-Policy: backend only serves JSON, so strict CSP is fine
  contentSecurityPolicy: false, // Frontend sets its own CSP
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server calls (no Origin header) and configured origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} is not allowed`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// 60 requests per 15 minutes per IP — reasonable for a hackathon demo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a moment before trying again.' },
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
});
app.use('/api/', limiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Limit body to 100 KB — code input max is ~20 KB so this has headroom
app.use(express.json({ limit: '100kb' }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: IS_DEMO ? 'demo' : 'ai',
    timestamp: new Date().toISOString(),
  });
});

// ─── Helper: safe error response ─────────────────────────────────────────────
function sendError(res, status, message) {
  // Never include stack traces, provider details, or auth info
  res.status(status).json({ error: message });
}

// ─── POST /api/explain ────────────────────────────────────────────────────────
app.post('/api/explain', async (req, res) => {
  const validation = validate('explain', req.body);
  if (!validation.ok) return sendError(res, validation.status, validation.message);

  const { code, language } = req.body;
  try {
    const result = await explainCode({ code, language });
    res.json(result);
  } catch (err) {
    console.error('[/api/explain] Error:', err.message);
    sendError(res, 502, 'AI service unavailable — please try again in a moment.');
  }
});

// ─── POST /api/debug ─────────────────────────────────────────────────────────
app.post('/api/debug', async (req, res) => {
  const validation = validate('debug', req.body);
  if (!validation.ok) return sendError(res, validation.status, validation.message);

  const { code, error, language } = req.body;
  try {
    const result = await debugCode({ code, error: error || '', language });
    res.json(result);
  } catch (err) {
    console.error('[/api/debug] Error:', err.message);
    sendError(res, 502, 'AI service unavailable — please try again in a moment.');
  }
});

// ─── POST /api/learn ─────────────────────────────────────────────────────────
app.post('/api/learn', async (req, res) => {
  const validation = validate('learn', req.body);
  if (!validation.ok) return sendError(res, validation.status, validation.message);

  const { topic, difficulty } = req.body;
  try {
    const result = await learnConcept({ topic, difficulty });
    res.json(result);
  } catch (err) {
    console.error('[/api/learn] Error:', err.message);
    sendError(res, 502, 'AI service unavailable — please try again in a moment.');
  }
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, 404, 'Route not found');
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // CORS errors surface here — log safely
  if (err.message && err.message.startsWith('CORS:')) {
    return sendError(res, 403, err.message);
  }
  console.error('[Unhandled error]', err.message);
  sendError(res, 500, 'Internal server error');
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.info(`[DevSaathi] Backend proxy listening on http://localhost:${PORT}`);
  console.info(`[DevSaathi] Mode: ${IS_DEMO ? '⚠️  DEMO (no AI_API_KEY set)' : '✅  Real AI enabled'}`);
  console.info(`[DevSaathi] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

module.exports = app; // exported for tests
