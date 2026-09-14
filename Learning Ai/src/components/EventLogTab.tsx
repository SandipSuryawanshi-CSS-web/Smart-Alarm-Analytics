import React, { useState, useMemo } from 'react';
import { SystemEvent } from '../types/alarm';

interface EventLogTabProps {
  events: SystemEvent[];
}

export const EventLogTab: React.FC<EventLogTabProps> = ({ events }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const categories = [
    'ALL',
    'User Login',
    'Setpoint Change',
    'Agentic Recommendation',
    'Interlock Override',
    'Recipe Change',
    'Calibration'
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      if (selectedRole !== 'ALL' && e.userRole !== selectedRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.userId.toLowerCase().includes(q) ||
          e.actionDetails.toLowerCase().includes(q) ||
          (e.nodeAffected && e.nodeAffected.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, selectedCategory, selectedRole, searchQuery]);

  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case 'Setpoint Change':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-blue-950/70 border border-blue-600 text-blue-300 text-[11px] font-mono font-medium">
            SETPOINT
          </span>
        );
      case 'Agentic Recommendation':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-purple-950/70 border border-purple-500 text-purple-300 text-[11px] font-mono font-bold">
            ⚡ AGENTIC AI
          </span>
        );
      case 'User Login':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-slate-800 border border-slate-600 text-slate-300 text-[11px] font-mono">
            SECURITY / AUTH
          </span>
        );
      case 'Interlock Override':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-amber-950/70 border border-amber-600 text-amber-300 text-[11px] font-mono font-bold">
            BYPASS / OVERRIDE
          </span>
        );
      case 'Recipe Change':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-teal-950/70 border border-teal-600 text-teal-300 text-[11px] font-mono font-medium">
            RECIPE BATCH
          </span>
        );
      case 'Calibration':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-950/70 border border-emerald-600 text-emerald-300 text-[11px] font-mono font-medium">
            CALIBRATION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono">
            {category}
          </span>
        );
    }
  };

  const renderRoleBadge = (role: string) => {
    const isAI = role === 'AI Agent';
    return (
      <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
        isAI 
          ? 'bg-purple-900/50 text-purple-200 border-purple-600' 
          : 'bg-slate-900 text-slate-400 border-slate-800'
      }`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Explainer */}
      <div className="bg-[#121822] border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <span>System Event Log &amp; Audit Trail</span>
            <span className="text-[10px] font-mono bg-cyan-950/70 border border-cyan-600 text-cyan-300 px-1.5 py-0.5">
              NON-ALARM STATE AUDIT
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Strict chronological record of operator interventions, setpoint modifications, bypass authorizations, and autonomous AI recommendations.
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Total Audit Records:</span>
          <span className="text-cyan-300 font-bold">{events.length}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#121822] border border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-[11px] font-mono border transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-700 border-slate-500 text-cyan-300 font-bold'
                  : 'bg-[#0C1017] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search User, Tag or Action..."
            className="bg-[#0C1017] border border-slate-800 text-xs px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#121822] border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0D131C] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold font-mono text-[11px]">
              <th className="p-2.5 w-44 font-mono-numbers">Timestamp</th>
              <th className="p-2.5 w-44">Category</th>
              <th className="p-2.5 w-44">User / Agent ID</th>
              <th className="p-2.5 w-36">Node Affected</th>
              <th className="p-2.5">Action Details &amp; State Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                  No events found matching current search or category filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#151D28] transition-colors">
                  {/* Timestamp */}
                  <td className="p-2.5 font-mono-numbers text-slate-300 whitespace-nowrap">
                    {evt.timestamp}
                  </td>

                  {/* Category */}
                  <td className="p-2.5 whitespace-nowrap">
                    {renderCategoryBadge(evt.category)}
                  </td>

                  {/* User / Agent */}
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-200">{evt.userId}</span>
                      {renderRoleBadge(evt.userRole)}
                    </div>
                  </td>

                  {/* Node */}
                  <td className="p-2.5 font-mono text-cyan-300">
                    {evt.nodeAffected || '-'}
                  </td>

                  {/* Action Details */}
                  <td className="p-2.5 text-slate-300">
                    <div>{evt.actionDetails}</div>
                    {(evt.previousValue || evt.newValue) && (
                      <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center space-x-2">
                        <span className="bg-slate-900 px-1 py-0.5 border border-slate-800 text-slate-400">
                          PREV: {evt.previousValue}
                        </span>
                        <span>→</span>
                        <span className="bg-slate-900 px-1 py-0.5 border border-cyan-800 text-cyan-300">
                          NEW: {evt.newValue}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
        <span>Showing {filteredEvents.length} of {events.length} audit entries</span>
        <span>Cryptographically verified PLC &amp; SCADA telemetry log</span>
      </div>
    </div>
  );
};
