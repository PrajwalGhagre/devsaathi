import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { checkHealth } from '../services/aiService';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back — what would you like to build today?' },
  '/explain': { title: 'Explain Code', subtitle: 'Paste code and get a clear, structured explanation' },
  '/debug': { title: 'AI Debugger', subtitle: 'Share your code and error — get a root cause and fix' },
  '/learn': { title: 'Learn Mode', subtitle: 'Master any concept with explanations, examples, and quizzes' },
};

// Poll the backend health endpoint once on mount
function useServerHealth() {
  const [health, setHealth] = useState(null); // null = unknown, { mode, status } | false = offline
  useEffect(() => {
    let cancelled = false;
    checkHealth().then((h) => {
      if (!cancelled) setHealth(h || false);
    });
    return () => { cancelled = true; };
  }, []);
  return health;
}

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];
  const health = useServerHealth();

  const isOffline = health === false;
  const isDemo   = health === null || health?.mode === 'demo';
  const isRealAI = health && health.mode === 'ai';

  return (
    <header className="h-14 border-b border-[#30363d] bg-[#161b22] flex items-center px-4 gap-4 sticky top-0 z-10">
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] transition-colors cursor-pointer flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-[#e6edf3] truncate">{page.title}</h1>
        <p className="text-xs text-[#484f58] hidden sm:block truncate">{page.subtitle}</p>
      </div>

      {/* Right slot — server status indicator */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#21262d]">
          {isOffline ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#f85149]" />
              <span className="text-xs text-[#f85149]">Server offline</span>
            </>
          ) : isRealAI ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
              <span className="text-xs text-[#3fb950]">Real AI</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#d29922] animate-pulse" />
              <span className="text-xs text-[#8b949e]">Demo Mode</span>
            </>
          )}
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#388bfd] to-[#a371f7] flex items-center justify-center text-white text-xs font-bold select-none flex-shrink-0">
          DS
        </div>
      </div>
    </header>
  );
}
