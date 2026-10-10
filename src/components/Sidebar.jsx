import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/',
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
        <path d="M8.354 1.146a.5.5 0 00-.708 0l-6 6A.5.5 0 002 7.5v6a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-3h2v3a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-6a.5.5 0 00-.146-.354L8.354 1.146z" />
      </svg>
    ),
    label: 'Dashboard',
  },
  {
    to: '/explain',
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
        <path d="M14 1a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1h12zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" />
        <path d="M6.854 4.646a.5.5 0 010 .708L4.207 8l2.647 2.646a.5.5 0 01-.708.708l-3-3a.5.5 0 010-.708l3-3a.5.5 0 01.708 0zm2.292 0a.5.5 0 000 .708L11.793 8l-2.647 2.646a.5.5 0 00.708.708l3-3a.5.5 0 000-.708l-3-3a.5.5 0 00-.708 0z" />
      </svg>
    ),
    label: 'Explain Code',
  },
  {
    to: '/debug',
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
        <path d="M3.112 3.645A1.5 1.5 0 014.605 2H7a.5.5 0 01.5.5v.382c0 .696-.497 1.182-.872 1.469a.459.459 0 00-.115.118.113.113 0 000 .025V5h.5a.5.5 0 010 1H6.5v.947c.018.048.043.1.075.15.204.302.484.43.731.43h2a.5.5 0 010 1H7.306c-.247 0-.527.128-.731.43a1.058 1.058 0 00-.075.15V9.5h.5a.5.5 0 010 1H7v.418c0 .01.038.07.115.117.375.287.872.773.872 1.469V13.5a.5.5 0 01-1 0v-.382c0-.164-.11-.354-.237-.453l-.066-.051A1.5 1.5 0 014 11.145V8.5h-.5a.5.5 0 010-1H4V4.855a1.5 1.5 0 01-.888-1.21zM8.5 4.5V5h.5a.5.5 0 010 1H8.5v.947c.018.048.043.1.075.15.204.302.484.43.731.43H11a.5.5 0 010 1H9.306c-.247 0-.527.128-.731.43a1.058 1.058 0 00-.075.15V9.5h.5a.5.5 0 010 1H9v.418c0 .01.038.07.115.117.375.287.872.773.872 1.469V13.5a.5.5 0 01-1 0v-.382c0-.164-.11-.354-.237-.453l-.066-.051A1.5 1.5 0 017 11.145V8.5h-.5a.5.5 0 010-1H7V4.855A1.5 1.5 0 016.112 3.645M9 .5a.5.5 0 00-1 0V1H7a.5.5 0 000 1h1.5v1h-1a.5.5 0 000 1h1v.5a.5.5 0 001 0V3h1a.5.5 0 000-1h-1V1H10a.5.5 0 000-1H9V.5z" />
      </svg>
    ),
    label: 'AI Debugger',
  },
  {
    to: '/learn',
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.746c-.917-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 000 2.5v11a.5.5 0 00.707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 00.78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0016 13.5v-11a.5.5 0 00-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
      </svg>
    ),
    label: 'Learn Mode',
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-[#161b22] border-r border-[#30363d]
          sidebar-transition
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-[#30363d] ${collapsed ? 'lg:justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#388bfd] to-[#a371f7] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 16 16" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M6.854 4.646a.5.5 0 010 .708L4.207 8l2.647 2.646a.5.5 0 01-.708.708l-3-3a.5.5 0 010-.708l3-3a.5.5 0 01.708 0zm2.292 0a.5.5 0 000 .708L11.793 8l-2.647 2.646a.5.5 0 00.708.708l3-3a.5.5 0 000-.708l-3-3a.5.5 0 00-.708 0z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-[#e6edf3] whitespace-nowrap">DevSaathi AI</div>
              <div className="text-[10px] text-[#484f58] whitespace-nowrap">Coding Companion</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className={`px-3 mb-2 ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="text-[10px] font-semibold text-[#484f58] uppercase tracking-widest">Tools</span>
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg mb-0.5 transition-colors text-sm font-medium
                  ${isActive
                    ? 'bg-[#388bfd20] text-[#58a6ff] border border-[#388bfd30]'
                    : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] border border-transparent'}
                  ${collapsed ? 'lg:justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-[#388bfd]' : ''}`}>{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-3 border-t border-[#30363d] ${collapsed ? 'lg:px-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0d1117] border border-[#21262d]">
              <div className="w-2 h-2 rounded-full bg-[#d29922] flex-shrink-0" />
              <span className="text-[10px] text-[#8b949e]">Demo Mode</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
