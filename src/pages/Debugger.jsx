import { useState } from 'react';
import {
  Button, Select, CodeTextarea, CodeBlock, Textarea,
  LoadingState, EmptyState, ErrorState,
  DemoBanner, ServerOfflineBanner, SamplePrompts, ResultSection, Badge,
} from '../components/ui';
import { debugCode } from '../services/aiService';
import SmartActionPlan from '../components/SmartActionPlan';

const MAX_CODE_LENGTH = 20_000;
const MAX_ERROR_LENGTH = 2_000;

const LANGUAGES = [
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'C++', label: 'C++' },
  { value: 'C#', label: 'C#' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
];

const SAMPLE_PROMPTS = [
  {
    label: 'TypeError (JS)',
    language: 'JavaScript',
    code: `async function fetchUser(id) {
  const res = await fetch('/api/users/' + id);
  const data = res.json();
  return data.name.toUpperCase();
}`,
    error: "TypeError: Cannot read properties of undefined (reading 'name')",
  },
  {
    label: 'Index Error (Python)',
    language: 'Python',
    code: `def get_last(items):
    return items[len(items)]

my_list = [1, 2, 3]
print(get_last(my_list))`,
    error: 'IndexError: list index out of range',
  },
  {
    label: 'NullPointerException (Java)',
    language: 'Java',
    code: `public class Main {
  public static void main(String[] args) {
    String name = null;
    System.out.println(name.length());
  }
}`,
    error: 'Exception in thread "main" java.lang.NullPointerException',
  },
  {
    label: 'Off-by-one (C++)',
    language: 'C++',
    code: `#include <vector>
int main() {
  std::vector<int> v = {1, 2, 3};
  for (int i = 0; i <= v.size(); i++) {
    int x = v[i]; // bug here
  }
}`,
    error: 'Segmentation fault (core dumped)',
  },
];

const SEVERITY_CONFIG = {
  high: { label: 'High', color: 'red', icon: '🔴' },
  medium: { label: 'Medium', color: 'orange', icon: '🟡' },
  low: { label: 'Low', color: 'green', icon: '🟢' },
};

export default function Debugger() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDebug = async () => {
    if (!code.trim()) return;
    if (code.length > MAX_CODE_LENGTH) {
      setErrorMsg(`Code is too long (${code.length.toLocaleString()} chars). Max is ${MAX_CODE_LENGTH.toLocaleString()}.`);
      setStatus('error');
      return;
    }
    if (error.length > MAX_ERROR_LENGTH) {
      setErrorMsg(`Error message is too long. Max is ${MAX_ERROR_LENGTH.toLocaleString()} characters.`);
      setStatus('error');
      return;
    }
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const data = await debugCode({ code, error, language });
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const handleSample = (prompt) => {
    setCode(prompt.code);
    setError(prompt.error);
    setLanguage(prompt.language);
    setResult(null);
    setStatus('idle');
  };

  const handleClear = () => {
    setCode('');
    setError('');
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
  };

  const sev = result ? SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.medium : null;

  return (
    <div className="space-y-6">
      {status === 'error' && errorMsg.includes('DevSaathi server')
        ? <ServerOfflineBanner />
        : <DemoBanner isDemo={result ? !!result._demo : true} />
      }

      {/* Input panel */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#e6edf3]">Debug Input</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">Paste your buggy code and the error message</p>
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
          placeholder={`// Paste the code that has a bug…\nfunction example() {\n  // Your buggy code here\n}`}
          rows={10}
          label="Code with bug"
        />

        <Textarea
          value={error}
          onChange={setError}
          placeholder="Paste the exact error message here (e.g. TypeError: Cannot read properties of undefined)"
          rows={3}
          label="Error message (optional but recommended)"
        />

        <SamplePrompts
          prompts={SAMPLE_PROMPTS}
          onSelect={handleSample}
          label="Try a sample bug"
        />

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleDebug}
            disabled={!code.trim()}
            loading={status === 'loading'}
            variant="purple"
            size="lg"
          >
            {status === 'loading' ? 'Debugging…' : '🐛 Debug Code'}
          </Button>
          {code && (
            <Button variant="ghost" size="lg" onClick={handleClear}>
              Clear
            </Button>
          )}
          {status === 'success' && (
            <Badge variant="green" className="ml-auto">✓ Debugged</Badge>
          )}
        </div>
      </div>

      {/* Output */}
      {status === 'idle' && !result && (
        <EmptyState
          icon="🐛"
          title="Debug results will appear here"
          description="Paste code and an error message, then click Debug Code to get root-cause analysis and a fix."
        />
      )}

      {status === 'loading' && <LoadingState message="Analyzing the bug…" />}
      {status === 'error' && <ErrorState message={errorMsg} onRetry={handleDebug} />}

      {status === 'success' && result && (
        <div className="space-y-4">
          {/* Severity banner */}
          {sev && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              result.severity === 'high' ? 'bg-[#da363310] border-[#da363340]' :
              result.severity === 'medium' ? 'bg-[#9e6a0310] border-[#d2992240]' :
              'bg-[#23863610] border-[#2ea04340]'
            }`}>
              <span className="text-lg">{sev.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${
                  result.severity === 'high' ? 'text-[#f85149]' :
                  result.severity === 'medium' ? 'text-[#d29922]' :
                  'text-[#3fb950]'
                }`}>
                  {sev.label} Severity — {result.probableCause}
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          <ResultSection title="Root Cause Analysis" icon="🔎" copyText={result.explanation}>
            <p className="text-sm text-[#e6edf3] leading-relaxed">{result.explanation}</p>
          </ResultSection>

          {/* Fixed code */}
          {result.correctedCode && (
            <CodeBlock
              code={result.correctedCode}
              language={language}
              label="Corrected Code"
            />
          )}

          {/* Prevention tips */}
          {result.preventionTips?.length > 0 && (
            <ResultSection title="Prevention Tips" icon="🛡️">
              <ul className="space-y-2">
                {result.preventionTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#c9d1d9]">
                    <span className="text-[#3fb950] flex-shrink-0 mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}

          {/* Smart Action Plan */}
          <SmartActionPlan mode="debug" language={language} result={result} />
        </div>
      )}
    </div>
  );
}
