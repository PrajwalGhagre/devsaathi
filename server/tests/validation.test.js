'use strict';

/**
 * Tests for server/validation.js
 * Run with: node --test tests/validation.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { validate, sanitiseAIResponse } = require('../validation');

// ─── validate() ──────────────────────────────────────────────────────────────

describe('validate — explain', () => {
  test('accepts valid inputs', () => {
    const r = validate('explain', { code: 'function foo() {}', language: 'JavaScript' });
    assert.equal(r.ok, true);
  });

  test('rejects missing code', () => {
    const r = validate('explain', { code: '', language: 'JavaScript' });
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
  });

  test('rejects code exceeding 20 000 chars', () => {
    const r = validate('explain', { code: 'x'.repeat(20_001), language: 'Python' });
    assert.equal(r.ok, false);
    assert.match(r.message, /exceeds maximum/);
  });

  test('rejects unknown language', () => {
    const r = validate('explain', { code: 'x', language: 'COBOL' });
    assert.equal(r.ok, false);
    assert.match(r.message, /language must be one of/);
  });

  test('rejects non-string code', () => {
    const r = validate('explain', { code: 12345, language: 'Python' });
    assert.equal(r.ok, false);
  });
});

describe('validate — debug', () => {
  test('accepts valid inputs with error message', () => {
    const r = validate('debug', { code: 'let x = null; x.y;', error: 'TypeError', language: 'JavaScript' });
    assert.equal(r.ok, true);
  });

  test('accepts missing error message (optional)', () => {
    const r = validate('debug', { code: 'let x = 1;', language: 'Python' });
    assert.equal(r.ok, true);
  });

  test('rejects error message exceeding 2000 chars', () => {
    const r = validate('debug', { code: 'x', error: 'e'.repeat(2_001), language: 'Python' });
    assert.equal(r.ok, false);
    assert.match(r.message, /exceeds maximum/);
  });

  test('rejects unknown language', () => {
    const r = validate('debug', { code: 'x', language: 'Brainfuck' });
    assert.equal(r.ok, false);
  });
});

describe('validate — learn', () => {
  test('accepts valid topic and difficulty', () => {
    const r = validate('learn', { topic: 'Closures', difficulty: 'Beginner' });
    assert.equal(r.ok, true);
  });

  test('rejects empty topic', () => {
    const r = validate('learn', { topic: '', difficulty: 'Beginner' });
    assert.equal(r.ok, false);
  });

  test('rejects topic over 300 chars', () => {
    const r = validate('learn', { topic: 't'.repeat(301), difficulty: 'Intermediate' });
    assert.equal(r.ok, false);
    assert.match(r.message, /exceeds maximum/);
  });

  test('rejects invalid difficulty', () => {
    const r = validate('learn', { topic: 'Closures', difficulty: 'Expert' });
    assert.equal(r.ok, false);
    assert.match(r.message, /difficulty must be one of/);
  });
});

// ─── sanitiseAIResponse() ─────────────────────────────────────────────────────

describe('sanitiseAIResponse — explain', () => {
  test('passes through valid response', () => {
    const input = {
      summary: 'A function',
      keyConcepts: [{ term: 'Variable', definition: 'Stores a value' }],
      lineByLine: [{ lines: '1-3', explanation: 'Setup' }],
      example: 'foo()',
      complexity: 'O(1)',
    };
    const out = sanitiseAIResponse('explain', input);
    assert.equal(out.summary, 'A function');
    assert.equal(out.keyConcepts.length, 1);
  });

  test('filters out incomplete keyConcepts entries', () => {
    const input = {
      summary: 'x',
      keyConcepts: [{ term: '', definition: 'x' }, { term: 'Valid', definition: 'ok' }],
      lineByLine: [],
      example: '',
      complexity: '',
    };
    const out = sanitiseAIResponse('explain', input);
    assert.equal(out.keyConcepts.length, 1);
    assert.equal(out.keyConcepts[0].term, 'Valid');
  });

  test('handles missing optional fields gracefully', () => {
    const out = sanitiseAIResponse('explain', { summary: 'ok' });
    assert.equal(typeof out.summary, 'string');
    assert.deepEqual(out.keyConcepts, []);
    assert.deepEqual(out.lineByLine, []);
  });
});

describe('sanitiseAIResponse — debug', () => {
  test('normalises invalid severity to medium', () => {
    const out = sanitiseAIResponse('debug', {
      severity: '<script>alert(1)</script>',
      probableCause: 'x',
      explanation: 'y',
      correctedCode: 'z',
      preventionTips: [],
    });
    assert.equal(out.severity, 'medium');
  });

  test('accepts valid severity values', () => {
    for (const sev of ['low', 'medium', 'high']) {
      const out = sanitiseAIResponse('debug', { severity: sev });
      assert.equal(out.severity, sev);
    }
  });

  test('filters empty prevention tips', () => {
    const out = sanitiseAIResponse('debug', {
      severity: 'low',
      preventionTips: ['', 'Valid tip', null, 'Another tip'],
    });
    assert.equal(out.preventionTips.length, 2);
  });
});

describe('sanitiseAIResponse — learn', () => {
  test('passes valid quiz structure', () => {
    const out = sanitiseAIResponse('learn', {
      title: 'Closures',
      explanation: 'explanation here',
      quiz: [
        { question: 'What is a closure?', options: ['A', 'B', 'C', 'D'], answer: 1 },
      ],
    });
    assert.equal(out.quiz.length, 1);
    assert.equal(out.quiz[0].answer, 1);
  });

  test('clamps answer index to integer', () => {
    const out = sanitiseAIResponse('learn', {
      quiz: [{ question: 'Q?', options: ['A', 'B'], answer: 1.9 }],
    });
    assert.equal(out.quiz[0].answer, 1);
  });

  test('filters quiz items with no question', () => {
    const out = sanitiseAIResponse('learn', {
      quiz: [
        { question: '', options: ['A', 'B'], answer: 0 },
        { question: 'Valid?', options: ['A', 'B'], answer: 0 },
      ],
    });
    assert.equal(out.quiz.length, 1);
  });
});
