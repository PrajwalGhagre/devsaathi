import { useClipboard } from '../hooks/useClipboard';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, className = '', type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer border select-none';
  const variants = {
    primary: 'bg-[#388bfd] hover:bg-[#4493f8] text-white border-[#388bfd] hover:border-[#4493f8] shadow-sm',
    secondary: 'bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border-[#30363d] hover:border-[#484f58]',
    ghost: 'bg-transparent hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] border-transparent',
    danger: 'bg-[#da3633] hover:bg-[#f85149] text-white border-[#da3633]',
    success: 'bg-[#238636] hover:bg-[#2ea043] text-white border-[#238636]',
    purple: 'bg-[#8250df] hover:bg-[#a371f7] text-white border-[#8250df]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
    xl: 'px-6 py-3 text-base',
  };
  const disabledCls = (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabledCls} ${className}`}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-[#161b22] border border-[#30363d] rounded-xl p-5 ${hover ? 'hover:border-[#388bfd60] hover:bg-[#1c2333] transition-colors duration-200 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#21262d] text-[#8b949e] border-[#30363d]',
    blue: 'bg-[#388bfd20] text-[#58a6ff] border-[#388bfd40]',
    green: 'bg-[#238636] text-[#3fb950] border-[#2ea04380]',
    orange: 'bg-[#9e6a0320] text-[#d29922] border-[#d2992240]',
    purple: 'bg-[#8250df20] text-[#a371f7] border-[#8250df40]',
    red: 'bg-[#da363320] text-[#f85149] border-[#da363340]',
    demo: 'bg-[#d29922] text-[#0d1117] border-[#d29922]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ value, onChange, options, label, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#388bfd] focus:ring-1 focus:ring-[#388bfd40] transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── CodeTextarea ─────────────────────────────────────────────────────────────
export function CodeTextarea({ value, onChange, placeholder, label, rows = 10, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">{label}</label>}
      <div className="focus-ring rounded-lg border border-[#30363d] overflow-hidden transition-colors">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border-b border-[#21262d]">
          <div className="w-3 h-3 rounded-full bg-[#f85149] opacity-70" />
          <div className="w-3 h-3 rounded-full bg-[#d29922] opacity-70" />
          <div className="w-3 h-3 rounded-full bg-[#3fb950] opacity-70" />
          <span className="ml-2 text-xs text-[#484f58]">code editor</span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          spellCheck={false}
          className="code-textarea w-full bg-[#0d1117] text-[#e6edf3] px-4 py-3 border-none outline-none placeholder-[#484f58] resize-y"
          style={{ minHeight: `${rows * 24}px` }}
        />
      </div>
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ value, onChange, placeholder, label, rows = 4, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#388bfd] focus:ring-1 focus:ring-[#388bfd40] transition-colors placeholder-[#484f58] resize-y"
        style={{ minHeight: `${rows * 24}px` }}
      />
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, label, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#388bfd] focus:ring-1 focus:ring-[#388bfd40] transition-colors placeholder-[#484f58]"
      />
    </div>
  );
}

// ─── CopyButton ───────────────────────────────────────────────────────────────
export function CopyButton({ text, className = '' }) {
  const { copied, copy } = useClipboard();
  return (
    <button
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-all cursor-pointer ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5 text-[#3fb950]" />
          <span className="text-[#3fb950]">Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────
export function CodeBlock({ code, language = '', label = 'Code' }) {
  if (!code) return null;
  return (
    <div className="rounded-lg border border-[#30363d] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">{label}</span>
          {language && <Badge variant="blue">{language}</Badge>}
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] px-4 py-3 overflow-x-auto text-sm text-[#e6edf3] font-mono leading-relaxed m-0">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── LoadingState ─────────────────────────────────────────────────────────────
export function LoadingState({ message = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-[#8b949e]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-[#30363d]" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-t-[#388bfd] animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#8b949e] animate-pulse-glow">{message}</p>
        <p className="text-xs text-[#484f58] mt-1">This may take a few seconds</p>
      </div>
      <div className="w-full max-w-md space-y-2 mt-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
        <div className="skeleton h-3 w-3/5" />
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      {icon && <div className="text-4xl mb-1 opacity-60">{icon}</div>}
      <p className="text-sm font-semibold text-[#8b949e]">{title}</p>
      {description && <p className="text-xs text-[#484f58] max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-[#da363320] border border-[#da363340] flex items-center justify-center">
        <svg className="w-6 h-6 text-[#f85149]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[#f85149]">Something went wrong</p>
      <p className="text-xs text-[#8b949e] max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ icon, title, subtitle, badge, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#388bfd20] border border-[#388bfd30] flex items-center justify-center text-lg flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#e6edf3]">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-[#8b949e] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── DemoBanner ───────────────────────────────────────────────────────────────
// isDemo: pass result._demo if you have a result, or omit to always show
export function DemoBanner({ isDemo = true }) {
  if (!isDemo) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#9e6a0310] border border-[#d2992240] rounded-lg text-xs text-[#d29922]">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        <strong>Demo Mode</strong> — Using sample AI responses. Set{' '}
        <code className="bg-[#21262d] px-1 py-0.5 rounded text-[#79c0ff]">AI_API_URL</code> +{' '}
        <code className="bg-[#21262d] px-1 py-0.5 rounded text-[#79c0ff]">AI_API_KEY</code> in{' '}
        <code className="bg-[#21262d] px-1 py-0.5 rounded text-[#79c0ff]">server/.env</code> to connect a real LLM.
      </span>
    </div>
  );
}

// ─── ServerOfflineBanner ──────────────────────────────────────────────────────
export function ServerOfflineBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#da363310] border border-[#da363340] rounded-lg text-xs text-[#f85149]">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        <strong>Server offline</strong> — Start the backend proxy:{' '}
        <code className="bg-[#21262d] px-1 py-0.5 rounded text-[#79c0ff]">cd server &amp;&amp; npm run dev</code>
      </span>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <hr className="border-[#21262d] my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-[#21262d]" />
      <span className="text-xs text-[#484f58]">{label}</span>
      <div className="flex-1 h-px bg-[#21262d]" />
    </div>
  );
}

// ─── SamplePrompts ────────────────────────────────────────────────────────────
export function SamplePrompts({ prompts, onSelect, label = 'Try an example' }) {
  return (
    <div>
      <p className="text-xs text-[#8b949e] mb-2">{label}:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p)}
            className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] rounded-md transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ResultSection ────────────────────────────────────────────────────────────
export function ResultSection({ title, icon, children, copyText, className = '' }) {
  return (
    <div className={`rounded-lg border border-[#30363d] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-xs font-semibold text-[#58a6ff] uppercase tracking-wide">{title}</span>
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Icons (inline SVG helpers) ───────────────────────────────────────────────
export function CopyIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" />
      <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" />
    </svg>
  );
}

export function CheckIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}
