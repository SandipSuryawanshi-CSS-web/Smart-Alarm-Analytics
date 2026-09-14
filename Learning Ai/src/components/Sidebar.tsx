import React from 'react';

export type DashboardTab = 'ACTIVE' | 'HISTORICAL' | 'EVENTS';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unackCount: number;
  totalActiveCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unackCount,
  totalActiveCount,
}) => {
  const tabs = [
    {
      id: 'ACTIVE' as DashboardTab,
      label: 'Active Alarms',
      sublabel: 'Real-Time Grid & Ack',
      badge: unackCount > 0 ? `${unackCount} UNACK` : `${totalActiveCount}`,
      badgeSeverity: unackCount > 0 ? 'unack' : 'normal',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'HISTORICAL' as DashboardTab,
      label: 'Historical Alarms',
      sublabel: 'ISA-18.2 Analytics & Pareto',
      badge: null,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'EVENTS' as DashboardTab,
      label: 'System Event Log',
      sublabel: 'Audit Trail & Non-Alarm States',
      badge: 'AUDIT',
      badgeSeverity: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-[#0A0E15] border-r border-slate-800 flex flex-col justify-between flex-shrink-0 select-none">
      {/* Navigation Links */}
      <div className="py-3">
        <div className="px-3 pb-2 mb-2 border-b border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Navigation Console
          </div>
          <div className="text-[11px] text-slate-400">
            High-Performance HMI (Level 2)
          </div>
        </div>

        <nav className="space-y-1 px-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 transition-all flex items-center justify-between border-l-2 ${
                  isActive
                    ? 'bg-[#15202E] border-cyan-400 text-cyan-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {tab.icon}
                  </span>
                  <div>
                    <div className="text-xs font-semibold tracking-wide">{tab.label}</div>
                    <div className="text-[10px] text-slate-400">{tab.sublabel}</div>
                  </div>
                </div>

                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                      tab.badgeSeverity === 'unack'
                        ? 'bg-red-950/80 text-red-300 border-red-700 animate-pulse'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator & System Health Metadata Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#080B10] text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">PLANT STATE:</span>
          <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-[10px] font-bold font-mono">
            STEADY STATE
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">ACTIVE SHIFT:</span>
          <span className="text-slate-300 font-mono">Shift B (Day)</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">OPERATOR:</span>
          <span className="text-slate-300 font-mono truncate max-w-[120px]">Op_John [402]</span>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
          Standard: ANSI/ISA-18.2-2016<br />
          Buffer Mode: Redis In-Memory Ring
        </div>
      </div>
    </aside>
  );
};
