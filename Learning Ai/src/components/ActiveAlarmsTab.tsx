import React, { useState, useMemo } from 'react';
import { ActiveAlarm, AlarmPriority } from '../types/alarm';

interface ActiveAlarmsTabProps {
  alarms: ActiveAlarm[];
  onAcknowledge: (alarmIds: string[]) => void;
  onShelve?: (alarmId: string) => void;
}

export const ActiveAlarmsTab: React.FC<ActiveAlarmsTabProps> = ({
  alarms,
  onAcknowledge,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [unackOnly, setUnackOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Derived metrics
  const totalActive = alarms.length;
  const unackCount = alarms.filter(a => a.status === 'UNACK_ALARM').length;
  const criticalCount = alarms.filter(a => a.priority === 'CRITICAL').length;
  const highCount = alarms.filter(a => a.priority === 'HIGH').length;

  // Filtered alarms
  const filteredAlarms = useMemo(() => {
    return alarms.filter(a => {
      if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
      if (unackOnly && a.status !== 'UNACK_ALARM') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.tagName.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.node.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alarms, priorityFilter, unackOnly, searchQuery]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = new Set(filteredAlarms.map(a => a.id));
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAcknowledgeSelected = () => {
    if (selectedIds.size === 0) return;
    onAcknowledge(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleAcknowledgeSingle = (id: string) => {
    onAcknowledge([id]);
  };

  // Helper for priority badges
  const renderPriorityBadge = (priority: AlarmPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-red-950/70 border border-red-600 text-red-300 text-xs font-bold font-mono">
            <span className="w-2 h-2 bg-red-600 rotate-45 inline-block"></span>
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-orange-950/70 border border-orange-500 text-orange-300 text-xs font-bold font-mono">
            <span className="w-2 h-2 bg-orange-500 inline-block"></span>
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-yellow-950/60 border border-yellow-500 text-yellow-300 text-xs font-semibold font-mono">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-blue-950/60 border border-blue-500 text-blue-300 text-xs font-medium font-mono">
            <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-400 inline-block"></span>
            <span>LOW</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Active Alarms */}
        <div className="bg-[#121822] border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <span>Total Active Alarms</span>
            <span className="text-slate-500 text-[11px] font-mono">PLC LIVE</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono-numbers text-slate-100">{totalActive}</span>
            <span className="text-xs text-slate-400">active states</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Buffered via Redis Stream #s7_live</div>
        </div>

        {/* Unacknowledged Alarms */}
        <div className={`border p-3 flex flex-col justify-between transition-all ${
          unackCount > 0 
            ? 'bg-red-950/30 border-red-700/80 shadow-[inset_0_0_12px_rgba(239,68,68,0.15)]' 
            : 'bg-[#121822] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold">
            <span className={unackCount > 0 ? 'text-red-300' : 'text-slate-400'}>Unacknowledged</span>
            {unackCount > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className={`text-2xl font-bold font-mono-numbers ${unackCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {unackCount}
            </span>
            <span className="text-xs text-slate-400">require operator ack</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires physical/HMI acknowledgment</div>
        </div>

        {/* Critical Priority Alarms */}
        <div className={`border p-3 flex flex-col justify-between ${
          criticalCount > 0 
            ? 'bg-[#1F1316] border-red-600/90' 
            : 'bg-[#121822] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold">
            <span className={criticalCount > 0 ? 'text-red-300' : 'text-slate-400'}>Critical Priority</span>
            <span className="text-[10px] font-mono px-1 py-0.5 bg-red-900/60 text-red-200 border border-red-700">ISA CAT 1</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className={`text-2xl font-bold font-mono-numbers ${criticalCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {criticalCount}
            </span>
            <span className="text-xs text-slate-400">immediate risk</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High-risk trip or safety interlock</div>
        </div>

        {/* High Priority Alarms */}
        <div className="bg-[#121822] border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <span>High Priority Alarms</span>
            <span className="text-orange-400 text-[11px] font-mono">PRIORITY 2</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono-numbers text-orange-300">{highCount}</span>
            <span className="text-xs text-slate-400">equipment limit warning</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Target Ack time: &lt; 5 minutes</div>
        </div>
      </div>

      {/* 2. Controls & Actions Toolbar */}
      <div className="bg-[#121822] border border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filters */}
          <div className="flex items-center border border-slate-800 bg-[#0C1017] p-0.5 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 text-[11px] font-mono transition-colors ${
                  priorityFilter === p
                    ? 'bg-slate-700 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Unack Only Toggle */}
          <button
            onClick={() => setUnackOnly(!unackOnly)}
            className={`px-2.5 py-1 text-xs font-mono border transition-colors flex items-center space-x-1.5 ${
              unackOnly
                ? 'bg-red-950/70 border-red-600 text-red-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 ${unackOnly ? 'bg-red-500' : 'bg-slate-600'}`}></span>
            <span>UNACK ONLY ({unackCount})</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tag, Node, Fault..."
              className="bg-[#0C1017] border border-slate-800 text-xs px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right: Bulk Actions */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono-numbers">
            Selected: <strong className="text-cyan-300">{selectedIds.size}</strong> of {filteredAlarms.length}
          </span>
          <button
            onClick={handleAcknowledgeSelected}
            disabled={selectedIds.size === 0}
            className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase border transition-colors flex items-center space-x-1.5 ${
              selectedIds.size > 0
                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-200 hover:bg-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Acknowledge Selected</span>
          </button>
        </div>
      </div>

      {/* 3. Live-Updating Data Table */}
      <div className="bg-[#121822] border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0D131C] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold font-mono text-[11px]">
              <th className="p-2.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredAlarms.length > 0 && selectedIds.size === filteredAlarms.length}
                  onChange={handleSelectAll}
                  className="rounded-none bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="p-2.5 w-40">Timestamp</th>
              <th className="p-2.5 w-28">Priority</th>
              <th className="p-2.5 w-36">Tag Name / Node</th>
              <th className="p-2.5">Fault Description</th>
              <th className="p-2.5 w-32 font-mono-numbers">Value / Limit</th>
              <th className="p-2.5 w-36">Status</th>
              <th className="p-2.5 w-28 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredAlarms.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                  No active alarms match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlarms.map((alarm) => {
                const isSelected = selectedIds.has(alarm.id);
                const isUnack = alarm.status === 'UNACK_ALARM';
                
                // Animation class based on priority for unacknowledged state
                let unackAnimClass = '';
                if (isUnack) {
                  if (alarm.priority === 'CRITICAL') unackAnimClass = 'alarm-unack-critical';
                  else if (alarm.priority === 'HIGH') unackAnimClass = 'alarm-unack-high';
                  else if (alarm.priority === 'MEDIUM') unackAnimClass = 'alarm-unack-medium';
                  else unackAnimClass = 'alarm-unack-low';
                }

                return (
                  <tr
                    key={alarm.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#152336]'
                        : isUnack
                        ? 'bg-[#17151D] hover:bg-[#1E1926]'
                        : 'hover:bg-[#151D28]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(alarm.id)}
                        className="rounded-none bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Timestamp */}
                    <td className="p-2.5 font-mono-numbers text-slate-300 whitespace-nowrap">
                      {alarm.timestamp}
                    </td>

                    {/* Priority */}
                    <td className="p-2.5">
                      {renderPriorityBadge(alarm.priority)}
                    </td>

                    {/* Tag Name & Node */}
                    <td className="p-2.5">
                      <div className="font-mono font-bold text-slate-100 tracking-wide">
                        {alarm.tagName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={alarm.node}>
                        {alarm.node}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-2.5 text-slate-200">
                      <div className="font-medium">{alarm.description}</div>
                      {alarm.acknowledgedBy && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ack by: {alarm.acknowledgedBy} ({alarm.acknowledgedAt})
                        </div>
                      )}
                    </td>

                    {/* Process Value vs Trip Limit */}
                    <td className="p-2.5 font-mono-numbers text-slate-200 whitespace-nowrap">
                      <span className="font-bold text-slate-100">{alarm.processValue}</span>
                      <span className="text-slate-400 text-[11px]"> / {alarm.tripLimit} {alarm.engineeringUnit}</span>
                    </td>

                    {/* Status Badge (ISA-18.2 compliant) */}
                    <td className="p-2.5">
                      {isUnack ? (
                        <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 border text-[11px] font-bold font-mono ${unackAnimClass}`}>
                          <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                          <span>ACTIVE / UNACK</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-slate-800/80 border border-slate-600 text-slate-300 text-[11px] font-semibold font-mono">
                          <span className="w-2 h-2 bg-emerald-400"></span>
                          <span>ACTIVE / ACKED</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-center">
                      {isUnack ? (
                        <button
                          onClick={() => handleAcknowledgeSingle(alarm.id)}
                          title="Acknowledge this alarm"
                          className="px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-600 text-cyan-300 hover:bg-cyan-900 transition-colors shadow-sm"
                        >
                          ACK
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400 italic">
                          ACKED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Summary */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
        <span>Showing {filteredAlarms.length} of {alarms.length} active alarms</span>
        <span>Standard: ISA-18.2-2016 Alarm State Model (UNACK -&gt; ACK -&gt; RTN)</span>
      </div>
    </div>
  );
};
