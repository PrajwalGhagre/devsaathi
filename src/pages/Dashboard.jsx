import { useNavigate } from 'react-router-dom';
import { Badge, DemoBanner } from '../components/ui';

const FEATURE_CARDS = [
  {
    to: '/explain',
    icon: '🔍',
    title: 'Explain Code',
    description: 'Paste any code snippet and get a clear, line-by-line explanation with key concepts and practical examples.',
    badge: { label: 'Most Used', variant: 'blue' },
    color: 'blue',
    examples: ['Explain this recursive function', 'What does this SQL query do?', 'Decode this regex pattern'],
  },
  {
    to: '/debug',
    icon: '🐛',
    title: 'AI Debugger',
    description: 'Share your code and error message. Get root-cause analysis, a corrected snippet, and tips to prevent it.',
    badge: { label: 'Popular', variant: 'purple' },
    color: 'purple',
    examples: ['TypeError: Cannot read undefined', 'NullPointerException on line 42', 'Segmentation fault in C++'],
  },
  {
    to: '/learn',
    icon: '📚',
    title: 'Learn Mode',
    description: 'Enter any concept — closures, async/await, Big O notation — and get a structured lesson with a quiz.',
    badge: { label: 'Interactive', variant: 'green' },
    color: 'green',
    examples: ['JavaScript Promises', 'SQL Joins explained', 'How does HTTPS work?'],
  },
];

const RECENT_ACTIVITIES = [
  { type: 'explain', lang: 'Python', label: 'Binary search implementation', time: '2 min ago' },
  { type: 'debug', lang: 'JavaScript', label: 'Promise chain rejection error', time: '15 min ago' },
  { type: 'learn', lang: 'Concept', label: 'Closures in JavaScript', time: '1 hr ago' },
  { type: 'explain', lang: 'Java', label: 'Spring Boot controller class', time: '3 hr ago' },
];

const STATS = [
  { label: 'Code Explained', value: '—', icon: '🔍', note: 'ready to explain' },
  { label: 'Bugs Fixed', value: '—', icon: '🐛', note: 'ready to debug' },
  { label: 'Topics Learned', value: '—', icon: '📚', note: 'ready to learn' },
  { label: 'Time Saved', value: '—', icon: '⚡', note: 'hours back in your day' },
];

const ACTIVITY_COLORS = { explain: 'blue', debug: 'purple', learn: 'green' };
const ACTIVITY_ICONS = { explain: '🔍', debug: '🐛', learn: '📚' };

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-[#161b22] border border-[#30363d] px-6 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#388bfd08] via-transparent to-[#a371f708] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#388bfd] to-[#a371f7] flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#e6edf3]">DevSaathi AI</h1>
              <p className="text-xs text-[#8b949e]">Your AI Coding Companion</p>
            </div>
            <Badge variant="demo" className="ml-2">DEMO</Badge>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#e6edf3] leading-tight mb-3">
            Learn faster.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#388bfd] to-[#a371f7]">Debug smarter.</span><br />
            Build with confidence.
          </p>
          <p className="text-sm text-[#8b949e] max-w-lg leading-relaxed mb-6">
            DevSaathi AI combines an AI code explainer, intelligent debugger, and interactive tutor in one tool.
            No tab-switching — get answers where you code.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/explain')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#388bfd] hover:bg-[#4493f8] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border border-[#388bfd]"
            >
              Start Explaining Code →
            </button>
            <button
              onClick={() => navigate('/learn')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-sm font-medium rounded-lg transition-colors cursor-pointer border border-[#30363d]"
            >
              Learn a Concept
            </button>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      <DemoBanner />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-[#e6edf3]">{s.value}</div>
            <div className="text-xs text-[#8b949e] mt-0.5">{s.label}</div>
            <div className="text-[10px] text-[#484f58] mt-1 italic">{s.note}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-sm font-semibold text-[#e6edf3] mb-4">AI Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.to}
              onClick={() => navigate(card.to)}
              className="group bg-[#161b22] border border-[#30363d] hover:border-[#388bfd60] rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-[#1c2333]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{card.icon}</div>
                <Badge variant={card.badge.variant}>{card.badge.label}</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-2 group-hover:text-[#58a6ff] transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed mb-4">{card.description}</p>
              <div className="space-y-1">
                {card.examples.map((ex) => (
                  <div key={ex} className="text-[11px] text-[#484f58] flex items-center gap-1.5">
                    <span className="text-[#388bfd]">›</span>
                    {ex}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-[#388bfd] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Recent + Quick Start */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div>
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-3">Sample Activity</h2>
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            {RECENT_ACTIVITIES.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i < RECENT_ACTIVITIES.length - 1 ? 'border-b border-[#21262d]' : ''}`}
              >
                <span className="text-base">{ACTIVITY_ICONS[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#e6edf3] truncate">{a.label}</p>
                  <p className="text-[10px] text-[#484f58]">{a.time}</p>
                </div>
                <Badge variant={ACTIVITY_COLORS[a.type]}>{a.lang}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick start */}
        <div>
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-3">Quick Start</h2>
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            {[
              { step: '1', title: 'Choose a tool', desc: 'Explain, Debug, or Learn from the sidebar.' },
              { step: '2', title: 'Enter your code or topic', desc: 'Paste code, describe an error, or type a concept.' },
              { step: '3', title: 'Get instant AI insights', desc: 'Receive structured explanations, fixes, and examples.' },
              { step: '4', title: 'Copy and apply', desc: 'Use the copy buttons to bring answers into your editor.' },
            ].map((s, i, arr) => (
              <div
                key={s.step}
                className={`flex items-start gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#21262d]' : ''}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#388bfd20] border border-[#388bfd40] flex items-center justify-center text-xs font-bold text-[#388bfd] flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#e6edf3]">{s.title}</p>
                  <p className="text-[11px] text-[#8b949e]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
