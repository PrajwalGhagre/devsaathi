import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ExplainCode from './pages/ExplainCode';
import Debugger from './pages/Debugger';
import LearnMode from './pages/LearnMode';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[#0d1117]">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main content area */}
        <div
          className={`flex flex-col flex-1 min-w-0 transition-all duration-200 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <Header onToggleSidebar={() => setSidebarCollapsed((c) => !c)} />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/explain" element={<ExplainCode />} />
                <Route path="/debug" element={<Debugger />} />
                <Route path="/learn" element={<LearnMode />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
