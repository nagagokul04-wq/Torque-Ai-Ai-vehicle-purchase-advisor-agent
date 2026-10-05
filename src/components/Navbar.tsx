import React from 'react';
import { ShieldCheck, Bookmark, Sparkles } from 'lucide-react';

export type DashboardTab = 'matchmaker' | 'auditor' | 'tco' | 'compare' | 'chat';

interface NavbarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenSaved,
  onOpenAdvisor,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('matchmaker')}
            className="group flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30 transition-transform group-hover:scale-105">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              Torque<span className="text-cyan-400">AI</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 Clean Nav Links / Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/60 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('matchmaker')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'matchmaker'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matchmaker
          </button>
          <button
            onClick={() => setActiveTab('auditor')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'auditor'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deal Auditor
          </button>
          <button
            onClick={() => setActiveTab('tco')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tco'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5-Year TCO
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compare Matrix
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-cyan-400/90 hover:text-cyan-300'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Advisor War Room
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="View saved shortlist"
          >
            <Bookmark className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Garage</span>
            <span className="font-mono tabular-nums text-cyan-400">({savedCount})</span>
          </button>
          <button
            onClick={onOpenAdvisor}
            className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Consult Agent</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 overflow-x-auto gap-1">
        {(['matchmaker', 'auditor', 'tco', 'compare', 'chat'] as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap capitalize ${
              activeTab === tab ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            {tab === 'chat' ? 'Advisor Room' : tab === 'tco' ? '5Y TCO' : tab}
          </button>
        ))}
      </div>
    </header>
  );
};
