import { useNavigate } from 'react-router-dom';
import { Button } from './ui';

/**
 * SmartActionPlan — shows context-aware next steps after an AI operation.
 * Props:
 *   mode: 'explain' | 'debug' | 'learn'
 *   language: string (for explain/debug)
 *   topic: string (for learn)
 *   difficulty: string (for learn)
 *   result: the AI result object
 */

function getActions({ mode, language, topic, difficulty, result }) {
  if (mode === 'explain') {
    return {
      headline: 'Next Steps',
      subtitle: `You've understood the code — here's what to do next.`,
      steps: [
        {
          icon: '🐛',
          title: 'Debug related code',
          description: 'If this code has an error or unexpected behaviour, take it to the AI Debugger.',
          action: { label: 'Open Debugger', to: '/debug' },
          color: 'purple',
        },
        {
          icon: '📚',
          title: `Deepen your ${language} knowledge`,
          description: `Explore a core ${language} concept that appeared in this code — closures, async, generics, etc.`,
          action: { label: 'Go to Learn Mode', to: '/learn' },
          color: 'green',
        },
        {
          icon: '🧪',
          title: 'Write tests for this code',
          description: 'Now that you understand the logic, write unit tests to validate edge cases and build confidence.',
          action: null,
          tip: `Use ${language === 'Python' ? 'pytest' : language === 'Java' ? 'JUnit 5' : language.includes('C#') ? 'xUnit' : 'Jest or Vitest'} for ${language} testing.`,
          color: 'blue',
        },
        {
          icon: '⚡',
          title: 'Consider performance',
          description: result?.complexity ? `Current complexity: ${result.complexity}. Look for O(log n) or O(1) alternatives.` : 'Analyse time and space complexity, and look for optimisation opportunities.',
          action: null,
          color: 'orange',
        },
      ],
    };
  }

  if (mode === 'debug') {
    const isHighSeverity = result?.severity === 'high';
    return {
      headline: 'Next Steps',
      subtitle: isHighSeverity
        ? '⚠️ High-severity bug — prioritise this fix.'
        : 'Bug identified — here\'s how to move forward.',
      steps: [
        {
          icon: '✅',
          title: 'Apply the fix and test it',
          description: 'Copy the corrected code, apply it in your editor, and run your test suite to confirm the bug is gone.',
          action: null,
          tip: 'Always run existing tests after applying a fix to catch regressions.',
          color: 'green',
        },
        {
          icon: '🛡️',
          title: 'Add defensive validation',
          description: 'Add null checks, type guards, or input validation to prevent this class of error from recurring.',
          action: null,
          color: 'blue',
        },
        {
          icon: '📋',
          title: 'Understand the root cause',
          description: 'Take the corrected code to Explain Code to fully understand why the fix works.',
          action: { label: 'Explain the fix', to: '/explain' },
          color: 'orange',
        },
        {
          icon: '🧪',
          title: 'Write a regression test',
          description: 'Write a test that fails on the original bug and passes after the fix. This prevents future regressions.',
          action: null,
          color: 'purple',
        },
      ],
    };
  }

  if (mode === 'learn') {
    const nextDifficulty = difficulty === 'Beginner' ? 'Intermediate' : difficulty === 'Intermediate' ? 'Advanced' : null;
    return {
      headline: 'Continue Learning',
      subtitle: `Great work exploring ${topic} at ${difficulty} level.`,
      steps: [
        ...(nextDifficulty ? [{
          icon: '🚀',
          title: `Advance to ${nextDifficulty} level`,
          description: `You've got the fundamentals. Explore ${topic} at a deeper level — trade-offs, edge cases, and real-world patterns.`,
          action: { label: `Learn at ${nextDifficulty} Level`, to: '/learn', state: { topic, difficulty: nextDifficulty } },
          color: 'blue',
        }] : []),
        {
          icon: '💻',
          title: 'Practice with a code example',
          description: `Paste a real implementation of ${topic} into the Code Explainer to see it in action.`,
          action: { label: 'Go to Explain Code', to: '/explain' },
          color: 'purple',
        },
        {
          icon: '🔗',
          title: 'Explore related concepts',
          description: difficulty === 'Beginner'
            ? 'Build a strong foundation — explore variables, functions, and control flow next.'
            : 'Connect this concept to design patterns, system design, or algorithmic thinking.',
          action: { label: 'Search a related topic', to: '/learn' },
          color: 'green',
        },
        {
          icon: '🏗️',
          title: 'Build a mini project',
          description: `The fastest path to retention is building something. Apply ${topic} in a small, self-contained project.`,
          action: null,
          tip: 'Even a 50-line program that uses this concept will solidify your understanding more than re-reading.',
          color: 'orange',
        },
      ],
    };
  }

  return null;
}

const COLOR_MAP = {
  blue: { dot: 'bg-[#388bfd]', border: 'border-[#388bfd30]', bg: 'bg-[#388bfd10]', title: 'text-[#58a6ff]' },
  purple: { dot: 'bg-[#a371f7]', border: 'border-[#a371f730]', bg: 'bg-[#a371f710]', title: 'text-[#a371f7]' },
  green: { dot: 'bg-[#3fb950]', border: 'border-[#3fb95030]', bg: 'bg-[#3fb95010]', title: 'text-[#3fb950]' },
  orange: { dot: 'bg-[#d29922]', border: 'border-[#d2992230]', bg: 'bg-[#d2992210]', title: 'text-[#d29922]' },
  red: { dot: 'bg-[#f85149]', border: 'border-[#f8514930]', bg: 'bg-[#f8514910]', title: 'text-[#f85149]' },
};

export default function SmartActionPlan({ mode, language, topic, difficulty, result }) {
  const navigate = useNavigate();
  const plan = getActions({ mode, language, topic, difficulty, result });
  if (!plan) return null;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-b border-[#21262d]">
        <span className="text-sm">🗺️</span>
        <span className="text-xs font-semibold text-[#58a6ff] uppercase tracking-wide">{plan.headline}</span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-[#8b949e]">{plan.subtitle}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {plan.steps.map((step, i) => {
            const c = COLOR_MAP[step.color] || COLOR_MAP.blue;
            return (
              <div
                key={i}
                className={`flex flex-col gap-2 p-3 rounded-lg border ${c.border} ${c.bg}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{step.icon}</span>
                  <span className={`text-xs font-semibold ${c.title}`}>{step.title}</span>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">{step.description}</p>
                {step.tip && (
                  <p className="text-[11px] text-[#484f58] italic border-t border-[#30363d] pt-2 mt-1">{step.tip}</p>
                )}
                {step.action && (
                  <div className="mt-auto pt-1">
                    <button
                      onClick={() => navigate(step.action.to, step.action.state ? { state: step.action.state } : undefined)}
                      className="text-xs font-medium text-[#388bfd] hover:text-[#58a6ff] transition-colors cursor-pointer"
                    >
                      {step.action.label} →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
