import { useState } from 'react';
import {
  Button, Select, CodeTextarea, CodeBlock,
  LoadingState, EmptyState, ErrorState,
  DemoBanner, ServerOfflineBanner, SamplePrompts, ResultSection, Badge, CopyButton,
} from '../components/ui';
import { explainCode } from '../services/aiService';
import SmartActionPlan from '../components/SmartActionPlan';

const MAX_CODE_LENGTH = 20_000;

const LANGUAGES = [
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'C++', label: 'C++' },
  { value: 'C#', label: 'C#' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'SQL', label: 'SQL' },
  { value: 'HTML/CSS', label: 'HTML/CSS' },
];

const SAMPLE_PROMPTS = [
  {
    label: 'Binary Search (Python)',
    language: 'Python',
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  {
    label: 'Debounce (JS)',
    language: 'JavaScript',
    code: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
  },
  {
    label: 'Closure Counter (JS)',
    language: 'JavaScript',
    code: `function makeCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
    reset: () => { count = start; },
  };
}`,
  },
  {
    label: 'Fibonacci (Recursive)',
    language: 'Python',
    code: `def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]`,
  },
];

export default function ExplainCode() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleExplain = async () => {
    if (!code.trim()) return;
    if (code.length > MAX_CODE_LENGTH) {
      setErrorMsg(`Code is too long (${code.length.toLocaleString()} chars). Maximum is ${MAX_CODE_LENGTH.toLocaleString()} characters.`);
      setStatus('error');
      return;
    }
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const data = await explainCode({ code, language });
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const handleSample = (prompt) => {
    setCode(prompt.code);
    setLanguage(prompt.language);
    setResult(null);
    setStatus('idle');
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Show offline banner on error if server unreachable, else demo banner based on result */}
      {status === 'error' && errorMsg.includes('DevSaathi server')
        ? <ServerOfflineBanner />
        : <DemoBanner isDemo={result ? !!result._demo : true} />
      }

      {/* Input panel */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#e6edf3]">Code Input</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">Paste the code you want explained</p>
          </div>
          <Select
            value={language}
            onChange={setLanguage}
            options={LANGUAGES}
            label="Language"
          />
        </div>

        <CodeTextarea
          value={code}
          onChange={setCode}
          placeholder={`// Paste your ${language} code here…\n// Example:\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}`}
          rows={12}
        />

        <SamplePrompts
          prompts={SAMPLE_PROMPTS}
          onSelect={handleSample}
          label="Quick examples"
        />

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleExplain}
            disabled={!code.trim()}
            loading={status === 'loading'}
            size="lg"
          >
            {status === 'loading' ? 'Explaining…' : '🔍 Explain Code'}
          </Button>
          {code && (
            <Button variant="ghost" size="lg" onClick={handleClear}>
              Clear
            </Button>
          )}
          {status === 'success' && (
            <Badge variant="green" className="ml-auto">✓ Explained</Badge>
          )}
        </div>
      </div>

      {/* Output */}
      {status === 'idle' && !result && (
        <EmptyState
          icon="🔍"
          title="Results will appear here"
          description="Paste code above and click Explain Code. Supports JavaScript, Python, Java, C++, C#, and more."
        />
      )}

      {status === 'loading' && <LoadingState message="Analyzing your code…" />}

      {status === 'error' && (
        <ErrorState message={errorMsg} onRetry={handleExplain} />
      )}

      {status === 'success' && result && (
        <div className="space-y-4">
          {/* Summary */}
          <ResultSection title="Summary" icon="📋" copyText={result.summary}>
            <p className="text-sm text-[#e6edf3] leading-relaxed">{result.summary}</p>
          </ResultSection>

          {/* Key Concepts */}
          {result.keyConcepts?.length > 0 && (
            <ResultSection title="Key Concepts" icon="💡">
              <div className="grid sm:grid-cols-2 gap-3">
                {result.keyConcepts.map((kc) => (
                  <div key={kc.term} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#58a6ff] mb-1">{kc.term}</p>
                    <p className="text-xs text-[#8b949e] leading-relaxed">{kc.definition}</p>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {/* Line-by-Line */}
          {result.lineByLine?.length > 0 && (
            <ResultSection title="Line-by-Line Breakdown" icon="🔬">
              <div className="space-y-3">
                {result.lineByLine.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <span className="inline-block bg-[#388bfd20] text-[#58a6ff] text-xs font-mono px-2 py-0.5 rounded border border-[#388bfd30]">
                        {item.lines}
                      </span>
                    </div>
                    <p className="text-sm text-[#c9d1d9] leading-relaxed">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {/* Example */}
          {result.example && (
            <CodeBlock code={result.example} language={language} label="Usage Example" />
          )}

          {/* Complexity */}
          {result.complexity && (
            <ResultSection title="Complexity Analysis" icon="⚡">
              <p className="text-sm text-[#e6edf3] font-mono leading-relaxed">{result.complexity}</p>
            </ResultSection>
          )}

          {/* Smart Action Plan */}
          <SmartActionPlan mode="explain" language={language} result={result} />
        </div>
      )}
    </div>
  );
}
