'use strict';

/**
 * DevSaathi AI — Server-side AI provider module.
 *
 * This is the ONLY place that holds or uses API credentials.
 * All credentials come from process.env (set in server/.env, never frontend).
 *
 * Supports any OpenAI-compatible /chat/completions endpoint.
 * When AI_API_URL is not configured, DEMO MODE is active.
 */

const { sanitiseAIResponse } = require('./validation');

// ─── Configuration (read once at startup) ────────────────────────────────────
const AI_API_URL  = (process.env.AI_API_URL  || '').trim();
const AI_API_KEY  = (process.env.AI_API_KEY  || '').trim();
const AI_MODEL    = (process.env.AI_MODEL    || 'gpt-4o-mini').trim();
const AI_TIMEOUT  = parseInt(process.env.AI_TIMEOUT_MS || '30000', 10);

const IS_DEMO = !AI_API_URL || !AI_API_KEY;

if (IS_DEMO) {
  console.info('[AI] Demo mode active — set AI_API_URL and AI_API_KEY in server/.env to enable real AI');
} else {
  // Log that we have credentials without logging their values
  console.info(`[AI] Real AI mode — endpoint: ${AI_API_URL}, model: ${AI_MODEL}`);
}

// ─── Internal fetch with timeout ─────────────────────────────────────────────
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Core LLM call ───────────────────────────────────────────────────────────
async function callLLM(systemPrompt, userMessage) {
  const res = await fetchWithTimeout(
    `${AI_API_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // NOTE: Authorization header is never logged
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage },
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    },
    AI_TIMEOUT
  );

  if (!res.ok) {
    // Do not forward provider error details (may contain rate-limit info, etc.)
    throw new Error(`AI provider returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI provider returned an empty response');
  }
  return content;
}

// ─── Parse + sanitise LLM response ───────────────────────────────────────────
async function callAndParse(type, systemPrompt, userMessage) {
  const raw = await callLLM(systemPrompt, userMessage);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI response was not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('AI response was not a JSON object');
  }
  return sanitiseAIResponse(type, parsed);
}

// ─── Public API ──────────────────────────────────────────────────────────────

async function explainCode({ code, language }) {
  if (IS_DEMO) {
    await simulateDelay(1800);
    return { _demo: true, ...mockExplainCode(code, language) };
  }
  const system = `You are DevSaathi AI, an expert coding tutor. Explain code clearly for a developer audience.
Return ONLY a JSON object with these exact keys:
- summary: string
- keyConcepts: array of { term: string, definition: string }
- lineByLine: array of { lines: string, explanation: string }
- example: string (code example showing usage)
- complexity: string (Big O analysis)`;
  const user = `Language: ${language}\n\nCode:\n${code}`;
  return callAndParse('explain', system, user);
}

async function debugCode({ code, error, language }) {
  if (IS_DEMO) {
    await simulateDelay(2000);
    return { _demo: true, ...mockDebugCode(code, error, language) };
  }
  const system = `You are DevSaathi AI, an expert debugger. Analyse the code and error message.
Return ONLY a JSON object with these exact keys:
- severity: "low" | "medium" | "high"
- probableCause: string (one-line root cause)
- explanation: string (detailed explanation)
- correctedCode: string (the fixed code)
- preventionTips: array of strings`;
  const user = `Language: ${language}\nError message: ${error || '(none provided)'}\n\nCode:\n${code}`;
  return callAndParse('debug', system, user);
}

async function learnConcept({ topic, difficulty }) {
  if (IS_DEMO) {
    await simulateDelay(2100);
    return { _demo: true, ...mockLearnConcept(topic, difficulty) };
  }
  const system = `You are DevSaathi AI, an expert technical educator. Teach the topic at the specified difficulty level.
Return ONLY a JSON object with these exact keys:
- title: string
- explanation: string (clear multi-paragraph explanation)
- analogy: string (real-world analogy)
- codeExample: string (working code example)
- keyTakeaways: array of strings (5 key points)
- quiz: array of { question: string, options: string[] (4 items), answer: number (0-3 index) }`;
  const user = `Topic: ${topic}\nDifficulty: ${difficulty}`;
  return callAndParse('learn', system, user);
}

module.exports = { explainCode, debugCode, learnConcept, IS_DEMO };

// ─── Demo delay ───────────────────────────────────────────────────────────────
const simulateDelay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Mock data (identical logic to the frontend, kept here for DRY demo mode) ─

function mockExplainCode(code, language) {
  return {
    summary: `This ${language} code demonstrates a common pattern for processing data. It ${
      code.includes('for') || code.includes('while') ? 'uses a loop to iterate' :
      code.includes('function') || code.includes('def') || code.includes('fn') ? 'defines a reusable function' :
      code.includes('class') ? 'defines an object-oriented class structure' :
      'performs a sequence of operations'
    } and handles the result accordingly.`,
    keyConcepts: [
      { term: 'Variable Declaration', definition: 'Variables store values that can be referenced and manipulated throughout the program.' },
      { term: 'Control Flow',         definition: 'Conditional statements and loops that determine the execution path of the program.' },
      { term: 'Function Abstraction', definition: 'Grouping reusable logic into named blocks that can be called with different inputs.' },
      { term: 'Return Value',         definition: 'The output produced by a function after completing its computation.' },
    ],
    lineByLine: [
      { lines: '1–3',   explanation: 'Initial setup — variables are declared and given default values.' },
      { lines: '4–8',   explanation: 'Core logic — the main processing transforms inputs into the desired output.' },
      { lines: '9–end', explanation: 'Result handling — the computed value is returned or displayed to the caller.' },
    ],
    example: `// Practical usage example:\n${language === 'Python' ? 'result = process(data)\nprint(f"Output: {result}")' : `const result = process(data);\nconsole.log('Output:', result);`}`,
    complexity: 'Time: O(n) — linear with input size. Space: O(1) — constant extra memory used.',
  };
}

function mockDebugCode(code, error = '', language) {
  const e = error.toLowerCase();
  const isTypeError = e.includes('type') || e.includes('undefined');
  const isSyntax    = e.includes('syntax') || e.includes('unexpected');
  const isNull      = e.includes('null') || e.includes('none');

  return {
    severity: isSyntax ? 'high' : isTypeError ? 'medium' : 'low',
    probableCause: isSyntax
      ? 'Syntax Error — a malformed statement is preventing the parser from reading the file.'
      : isTypeError
      ? 'Type Error — an operation is performed on a value of the wrong type.'
      : isNull
      ? 'Null/None Reference — a property is accessed on a null or undefined value.'
      : 'Runtime Error — an unexpected condition occurred during execution.',
    explanation: `The error "${error.slice(0, 120)}" typically occurs when ${
      isSyntax    ? 'the code structure does not conform to the language grammar.' :
      isTypeError ? 'you use a variable before assigning it, or pass the wrong data type.' :
      isNull      ? 'an object is accessed before it is initialized.' :
                    'an unexpected edge case is reached at runtime.'
    }`,
    correctedCode: code.replace(/\bvar\b/g, 'let') +
      (language === 'Python' ? '\n# Added null check above' : '\n// Added guard clause above'),
    preventionTips: [
      'Use a linter (ESLint, Pylint, Checkstyle) to catch issues before running.',
      'Write unit tests for edge cases — null inputs, empty arrays, and boundary values.',
      'Enable strict mode in JavaScript to surface hidden type errors.',
      'Use TypeScript or Python type hints to catch type mismatches at compile time.',
      'Add defensive null checks or optional chaining (?.) before accessing nested properties.',
    ],
  };
}

function mockLearnConcept(topic, difficulty) {
  const topicLower = topic.toLowerCase();
  const isBeginnerOrInter = difficulty === 'Beginner' || difficulty === 'Intermediate';

  if (topicLower.includes('closure')) {
    return {
      title: 'Closures in JavaScript',
      explanation: `A closure is a function that retains access to its outer (enclosing) scope even after the outer function has returned. JavaScript functions capture a reference to outer-scope variables, not a copy.\n\nClosures enable data encapsulation, factory functions, and the module pattern.`,
      analogy: 'Think of a closure like a backpack a function carries. When it leaves its "home" scope, it keeps the backpack of variables and can use them anywhere.',
      codeExample: `function makeCounter(start = 0) {\n  let count = start;\n  return {\n    increment() { count++; },\n    decrement() { count--; },\n    value()     { return count; },\n  };\n}\nconst counter = makeCounter(10);\ncounter.increment();\nconsole.log(counter.value()); // 11`,
      keyTakeaways: [
        'A closure remembers the scope it was created in.',
        'Inner functions can read and write outer variables.',
        'Closures are created every time a function is defined.',
        'Uses: data privacy, factory functions, callbacks, event handlers.',
        'Beware of memory leaks when closures hold large objects longer than needed.',
      ],
      quiz: [
        { question: 'What does a closure capture?', options: ['A copy of variables', 'A reference to outer scope variables', 'Only primitives', 'Nothing outside its own scope'], answer: 1 },
        { question: 'When is a closure created?', options: ['Only with arrow functions', 'Every time a function is defined', 'Only inside loops', 'Only with async functions'], answer: 1 },
        { question: 'Which pattern uses closures for data privacy?', options: ['Singleton', 'Module pattern', 'Observer', 'Factory method'], answer: 1 },
      ],
    };
  }

  if (topicLower.includes('async') || topicLower.includes('promise') || topicLower.includes('await')) {
    return {
      title: 'Async/Await & Promises',
      explanation: `JavaScript is single-threaded but handles long operations (network, I/O) without blocking. Promises represent a value available now, later, or never.\n\nasync/await is syntactic sugar over Promises, letting you write async code that reads like synchronous code.`,
      analogy: 'A Promise is like a restaurant pager. You order (start async work), get a pager (the Promise), and sit down. When food is ready, the pager buzzes — Promise resolved.',
      codeExample: `// ✅ async/await\nasync function loadAndSave(url) {\n  try {\n    const res  = await fetch(url);\n    const json = await res.json();\n    await save(json);\n    return json;\n  } catch (err) {\n    console.error('Failed:', err.message);\n  }\n}`,
      keyTakeaways: [
        'async functions always return a Promise.',
        'await pauses execution inside the async function, not the whole program.',
        'Always wrap await calls in try/catch for error handling.',
        'Use Promise.all() to run multiple async operations in parallel.',
        'Never use async inside Array.forEach — use for...of or Promise.all.',
      ],
      quiz: [
        { question: 'What does an async function always return?', options: ['undefined', 'A Promise', 'A callback', 'A generator'], answer: 1 },
        { question: 'How do you handle async/await errors?', options: ['.catch()', 'try/catch', 'onerror', 'Both A and B'], answer: 3 },
        { question: 'Which runs tasks in parallel?', options: ['await a; await b;', 'Promise.all([a, b])', 'async forEach', 'Promise.race'], answer: 1 },
      ],
    };
  }

  return {
    title: topic,
    explanation: `${topic} is a ${isBeginnerOrInter ? 'foundational' : 'advanced'} concept in software development.\n\nAt its core, ${topic} allows developers to ${difficulty === 'Advanced' ? 'reason about complex system behaviour and apply principled abstractions' : 'solve common problems in a clean and reusable way'}.`,
    analogy: `Think of ${topic} like building with LEGO — each piece has a defined interface and combines predictably with others.`,
    codeExample: `// Example: ${topic} (${difficulty})\nfunction demonstrate() {\n  // Core concept applied here\n  const result = applyPattern();\n  return result;\n}\nconsole.log(demonstrate());`,
    keyTakeaways: [
      `${topic} solves a specific category of programming challenges elegantly.`,
      `Knowing when to apply ${topic} is as important as knowing how.`,
      difficulty === 'Beginner' ? 'Start simple before tackling complex use cases.' : difficulty === 'Intermediate' ? 'Focus on composing this with other patterns.' : 'Evaluate trade-offs carefully — every abstraction has a cost.',
      'Read high-quality open-source code to see this in production.',
      'Build a small project that uses this concept end-to-end.',
    ],
    quiz: [
      { question: `What is the primary purpose of ${topic}?`, options: ['Improving performance only', 'Solving specific structural problems', 'Replacing all other patterns', 'Reducing code length'], answer: 1 },
      { question: 'When should you use this?', options: ['Always', 'Never in production', 'When it fits the problem', 'Only in large codebases'], answer: 2 },
      { question: 'Best way to learn this concept?', options: ['Read the spec once', 'Build real projects', 'Memorise the definition', 'Avoid until advanced'], answer: 1 },
    ],
  };
}
