'use strict';

/**
 * Integration tests for server routes using Node's built-in test runner.
 * Run with: node --test tests/routes.test.js
 *
 * These tests start the server on a random port and make real HTTP requests.
 * No AI calls are made — the server runs in demo mode (no AI_API_KEY set).
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Ensure demo mode for tests
delete process.env.AI_API_URL;
delete process.env.AI_API_KEY;
process.env.PORT = '0'; // OS assigns a random free port
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';

// Load the app AFTER setting env vars
const app = require('../index');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

// ─── Helper: simple fetch using node:http ─────────────────────────────────────
function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: 'localhost',
      port: server.address().port,
      path,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Health check ─────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns 200 with ok status', async () => {
    const r = await request('GET', '/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ok');
    assert.equal(r.body.mode, 'demo');
  });
});

// ─── /api/explain ─────────────────────────────────────────────────────────────

describe('POST /api/explain', () => {
  test('returns demo explanation for valid input', async () => {
    const r = await request('POST', '/api/explain', {
      code: 'function add(a,b){return a+b;}',
      language: 'JavaScript',
    });
    assert.equal(r.status, 200);
    assert.ok(typeof r.body.summary === 'string' && r.body.summary.length > 0);
    assert.ok(Array.isArray(r.body.keyConcepts));
    assert.equal(r.body._demo, true);
  });

  test('returns 400 for empty code', async () => {
    const r = await request('POST', '/api/explain', { code: '', language: 'JavaScript' });
    assert.equal(r.status, 400);
    assert.ok(r.body.error);
  });

  test('returns 400 for unknown language', async () => {
    const r = await request('POST', '/api/explain', { code: 'x', language: 'COBOL' });
    assert.equal(r.status, 400);
  });

  test('returns 400 for oversized code input', async () => {
    const r = await request('POST', '/api/explain', {
      code: 'x'.repeat(20_001),
      language: 'Python',
    });
    assert.equal(r.status, 400);
    assert.match(r.body.error, /exceeds maximum/);
  });

  test('returns 400 when code is missing entirely', async () => {
    const r = await request('POST', '/api/explain', { language: 'Python' });
    assert.equal(r.status, 400);
  });
});

// ─── /api/debug ───────────────────────────────────────────────────────────────

describe('POST /api/debug', () => {
  test('returns demo debug result for valid input', async () => {
    const r = await request('POST', '/api/debug', {
      code: 'let x = null; x.foo;',
      error: 'TypeError: Cannot read properties of null',
      language: 'JavaScript',
    });
    assert.equal(r.status, 200);
    assert.ok(['low', 'medium', 'high'].includes(r.body.severity));
    assert.equal(r.body._demo, true);
  });

  test('severity is always a valid enum value', async () => {
    const r = await request('POST', '/api/debug', {
      code: 'x',
      language: 'Python',
    });
    assert.equal(r.status, 200);
    assert.ok(['low', 'medium', 'high'].includes(r.body.severity));
  });

  test('returns 400 for oversized error message', async () => {
    const r = await request('POST', '/api/debug', {
      code: 'x',
      error: 'e'.repeat(2_001),
      language: 'Python',
    });
    assert.equal(r.status, 400);
  });
});

// ─── /api/learn ───────────────────────────────────────────────────────────────

describe('POST /api/learn', () => {
  test('returns demo lesson for valid input', async () => {
    const r = await request('POST', '/api/learn', {
      topic: 'Closures in JavaScript',
      difficulty: 'Intermediate',
    });
    assert.equal(r.status, 200);
    assert.ok(typeof r.body.title === 'string');
    assert.ok(Array.isArray(r.body.quiz));
    assert.equal(r.body._demo, true);
  });

  test('returns 400 for invalid difficulty', async () => {
    const r = await request('POST', '/api/learn', {
      topic: 'Closures',
      difficulty: 'Expert',
    });
    assert.equal(r.status, 400);
  });

  test('returns 400 for empty topic', async () => {
    const r = await request('POST', '/api/learn', { topic: '', difficulty: 'Beginner' });
    assert.equal(r.status, 400);
  });

  test('quiz answer is always a safe integer', async () => {
    const r = await request('POST', '/api/learn', { topic: 'async', difficulty: 'Beginner' });
    assert.equal(r.status, 200);
    for (const q of r.body.quiz) {
      assert.ok(Number.isInteger(q.answer), `answer ${q.answer} must be integer`);
    }
  });
});

// ─── 404 catch ────────────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  test('returns 404 for unknown path', async () => {
    const r = await request('GET', '/api/nonexistent');
    assert.equal(r.status, 404);
  });
});
