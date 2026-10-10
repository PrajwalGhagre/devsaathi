'use strict';

/**
 * Input validation for all AI proxy endpoints.
 * All limits are enforced here — call validate() before touching user input.
 */

const ALLOWED_LANGUAGES = new Set([
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
  'Go', 'Rust', 'SQL', 'HTML/CSS', 'Ruby', 'Swift', 'Kotlin', 'PHP',
]);

const ALLOWED_DIFFICULTIES = new Set(['Beginner', 'Intermediate', 'Advanced']);

const LIMITS = {
  code:     { max: 20_000, label: 'code' },       // ~500 lines
  error:    { max: 2_000,  label: 'error message' },
  topic:    { max: 300,    label: 'topic' },
  language: { max: 20,     label: 'language' },
};

/**
 * Returns { ok: true } or { ok: false, status: 400, message: string }
 */
function validate(type, body) {
  switch (type) {
    case 'explain': {
      const { code, language } = body;
      const codeErr = validateText('code', code, LIMITS.code);
      if (codeErr) return codeErr;
      const langErr = validateLanguage(language);
      if (langErr) return langErr;
      return { ok: true };
    }
    case 'debug': {
      const { code, error, language } = body;
      const codeErr = validateText('code', code, LIMITS.code);
      if (codeErr) return codeErr;
      // error is optional but if present must be bounded
      if (error !== undefined && error !== null) {
        const errErr = validateText('error', error, LIMITS.error, false);
        if (errErr) return errErr;
      }
      const langErr = validateLanguage(language);
      if (langErr) return langErr;
      return { ok: true };
    }
    case 'learn': {
      const { topic, difficulty } = body;
      const topicErr = validateText('topic', topic, LIMITS.topic);
      if (topicErr) return topicErr;
      if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
        return {
          ok: false, status: 400,
          message: `difficulty must be one of: ${[...ALLOWED_DIFFICULTIES].join(', ')}`,
        };
      }
      return { ok: true };
    }
    default:
      return { ok: false, status: 400, message: 'Unknown operation type' };
  }
}

function validateText(field, value, limit, required = true) {
  if (required && (value === undefined || value === null || value === '')) {
    return { ok: false, status: 400, message: `${limit.label} is required` };
  }
  if (typeof value !== 'string') {
    return { ok: false, status: 400, message: `${limit.label} must be a string` };
  }
  if (value.length > limit.max) {
    return {
      ok: false, status: 400,
      message: `${limit.label} exceeds maximum length of ${limit.max} characters`,
    };
  }
  return null;
}

function validateLanguage(language) {
  if (!language || typeof language !== 'string') {
    return { ok: false, status: 400, message: 'language is required' };
  }
  if (!ALLOWED_LANGUAGES.has(language)) {
    return {
      ok: false, status: 400,
      message: `language must be one of: ${[...ALLOWED_LANGUAGES].join(', ')}`,
    };
  }
  return null;
}

/**
 * Validate and sanitise an AI JSON response for a given operation type.
 * Returns sanitised data or throws an Error with a safe message.
 */
function sanitiseAIResponse(type, data) {
  if (type === 'explain') {
    return {
      summary: safeStr(data.summary, ''),
      keyConcepts: safeArray(data.keyConcepts).map((kc) => ({
        term: safeStr(kc?.term, ''),
        definition: safeStr(kc?.definition, ''),
      })).filter((kc) => kc.term),
      lineByLine: safeArray(data.lineByLine).map((ll) => ({
        lines: safeStr(ll?.lines, ''),
        explanation: safeStr(ll?.explanation, ''),
      })).filter((ll) => ll.lines),
      example: safeStr(data.example, ''),
      complexity: safeStr(data.complexity, ''),
    };
  }

  if (type === 'debug') {
    const rawSeverity = safeStr(data.severity, 'medium');
    const severity = ['low', 'medium', 'high'].includes(rawSeverity) ? rawSeverity : 'medium';
    return {
      severity,
      probableCause: safeStr(data.probableCause, ''),
      explanation: safeStr(data.explanation, ''),
      correctedCode: safeStr(data.correctedCode, ''),
      preventionTips: safeArray(data.preventionTips).map((t) => safeStr(t, '')).filter(Boolean),
    };
  }

  if (type === 'learn') {
    return {
      title: safeStr(data.title, ''),
      explanation: safeStr(data.explanation, ''),
      analogy: safeStr(data.analogy, ''),
      codeExample: safeStr(data.codeExample, ''),
      keyTakeaways: safeArray(data.keyTakeaways).map((t) => safeStr(t, '')).filter(Boolean),
      quiz: safeArray(data.quiz).map((q) => ({
        question: safeStr(q?.question, ''),
        options: safeArray(q?.options).map((o) => safeStr(o, '')).filter(Boolean),
        answer: typeof q?.answer === 'number' ? Math.trunc(q.answer) : 0,
      })).filter((q) => q.question && q.options.length > 0),
    };
  }

  throw new Error(`Unknown type for sanitisation: ${type}`);
}

// Helpers
function safeStr(val, fallback) {
  if (typeof val === 'string') return val.slice(0, 50_000); // absolute ceiling
  return fallback;
}
function safeArray(val) {
  return Array.isArray(val) ? val.slice(0, 50) : [];
}

module.exports = { validate, sanitiseAIResponse, ALLOWED_LANGUAGES, ALLOWED_DIFFICULTIES };
