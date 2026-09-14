import React, { useState } from 'react';
import { 
  HistoricalAlarm, 
  TimeRangeFilter, 
  ISA182Metrics, 
  FrequentAlarmPareto,
  AlarmPriority
} from '../types/alarm';
import { MOCK_PARETO_DATA, MOCK_TIME_SERIES_DATA } from '../data/mockData';

interface HistoricalAlarmsTabProps {
  historicalAlarms: HistoricalAlarm[];
  metrics: ISA182Metrics;
}

export const HistoricalAlarmsTab: React.FC<HistoricalAlarmsTabProps> = ({
  historicalAlarms,
  metrics,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('24H');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; total: number; trip?: string } | null>(null);

  // Time series dataset for the selected range
  const timeSeriesData = MOCK_TIME_SERIES_DATA[timeRange];
  const maxTimeSeriesValue = Math.max(...timeSeriesData.map(d => d.total), 10);

  // Filtered historical table records
  const filteredRecords = historicalAlarms.filter(a => {
    if (filterPriority !== 'ALL' && a.priority !== filterPriority) return false;
    return true;
  });

  // Calculate dynamic metrics based on timeRange
  const calculatedAvgHour = timeRange === '1H' ? 6.2 : timeRange === '24H' ? 4.8 : 3.9;
  const calculatedPeak = timeRange === '1H' ? 9 : timeRange === '24H' ? 23 : 31;
  const isAvgAcceptable = calculatedAvgHour <= 6.0;

  const renderPriorityBadge = (priority: AlarmPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-red-950/60 border border-red-600 text-red-300 text-[10px] font-bold font-mono">
            <span className="w-1.5 h-1.5 bg-red-600 rotate-45 inline-block"></span>
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-orange-950/60 border border-orange-500 text-orange-300 text-[10px] font-bold font-mono">
            <span className="w-1.5 h-1.5 bg-orange-500 inline-block"></span>
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-yellow-950/60 border border-yellow-500 text-yellow-300 text-[10px] font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
            <span>MED</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-blue-950/60 border border-blue-500 text-blue-300 text-[10px] font-medium font-mono">
            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-blue-400 inline-block"></span>
            <span>LOW</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with Time Filter & Export */}
      <div className="bg-[#121822] border border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Analysis Window:
            </span>
            <div className="flex border border-slate-800 bg-[#0C1017] p-0.5">
              {(['1H', '24H', '7D'] as TimeRangeFilter[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-mono transition-colors ${
                    timeRange === r
                      ? 'bg-cyan-900/60 border border-cyan-500 text-cyan-200 font-bold'
                      : 'border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r === '1H' ? 'Last 1 Hour' : r === '24H' ? 'Last 24 Hours' : 'Last 7 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            <span>ISA-18.2 Clause 16 Audit Mode</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Export:</span>
          <button 
            onClick={() => alert("Simulated CSV Export generated for historical audit logs.")}
            className="px-2.5 py-1 bg-[#0D131C] border border-slate-700 hover:border-slate-500 text-slate-300 font-mono transition-colors"
          >
            CSV
          </button>
          <button 
            onClick={() => alert("Simulated PDF ISA-18.2 Compliance Report generated.")}
            className="px-2.5 py-1 bg-[#0D131C] border border-slate-700 hover:border-slate-500 text-slate-300 font-mono transition-colors"
          >
            PDF Report
          </button>
        </div>
      </div>

      {/* 2. ISA-18.2 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Average Alarms / Hour (Target < 6) */}
        <div className="bg-[#121822] border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Average Alarms / Hour</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border ${
              isAvgAcceptable 
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700' 
                : 'bg-amber-950/70 text-amber-300 border-amber-700'
            }`}>
              {isAvgAcceptable ? 'TARGET MET' : 'ATTENTION'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className={`text-3xl font-bold font-mono-numbers ${isAvgAcceptable ? 'text-emerald-400' : 'text-amber-400'}`}>
              {calculatedAvgHour}
            </span>
            <span className="text-xs text-slate-400">/ hour (Target: &lt; 6.0)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ISA-18.2 Table 2 manageable threshold: &lt; 144 / day
          </div>
        </div>

        {/* Metric 2: Peak Alarms / 10 min (Flood threshold > 10) */}
        <div className="bg-[#121822] border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Peak Alarms / 10 min</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border ${
              calculatedPeak > 10 
                ? 'bg-red-950/70 text-red-300 border-red-700' 
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
            }`}>
              {calculatedPeak > 10 ? 'FLOOD DETECTED' : 'NORMAL'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className={`text-3xl font-bold font-mono-numbers ${calculatedPeak > 10 ? 'text-red-400' : 'text-slate-100'}`}>
              {calculatedPeak}
            </span>
            <span className="text-xs text-slate-400">peak / 10m (Flood limit: &gt;10)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Alarm flood period identified during plant upset
          </div>
        </div>

        {/* Metric 3: Chattering Alarms (Bad Actors) */}
        <div className="bg-[#121822] border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Chattering Bad Actors</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-950/70 text-amber-300 border border-amber-700">
              ACTION REQ
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-bold font-mono-numbers text-amber-400">
              {metrics.chatteringAlarmsCount}
            </span>
            <span className="text-xs text-slate-400">tags (&gt;3 transitions / min)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Recommends deadband adjustment for PUMP02_Press
          </div>
        </div>

        {/* Metric 4: Ack Compliance Rate */}
        <div className="bg-[#121822] border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Ack Compliance (&lt;5 min)</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-700">
              94.2% PASS
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-bold font-mono-numbers text-cyan-400">
              {metrics.percentAckUnder5Min}%
            </span>
            <span className="text-xs text-slate-400">prompt operator response</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Mean Time To Acknowledge: 42 seconds
          </div>
        </div>
      </div>

      {/* 3. Analytics Charts (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 1: Pareto Chart (Top 5 Most Frequent Bad Actors) */}
        <div className="bg-[#121822] border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Top 5 Most Frequent Alarms (Pareto Bad Actors)
              </div>
              <div className="text-[11px] text-slate-400">
                Identifies chattering tags contributing to &gt;80% of total operator load
              </div>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 text-cyan-300 border border-slate-700">
              80/20 RULE
            </span>
          </div>

          {/* Pareto Visual Representation */}
          <div className="space-y-2.5 pt-1">
            {MOCK_PARETO_DATA.map((item, idx) => {
              return (
                <div key={item.tagName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-bold w-4">#{idx + 1}</span>
                      <span className="font-bold text-slate-200">{item.tagName}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px] hidden sm:inline">
                        ({item.description})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-numbers font-bold text-cyan-300">{item.count} hits</span>
                      <span className="text-slate-500 text-[11px]">({item.percentage}%)</span>
                      <span className="text-amber-400 text-[11px] font-bold">Cum: {item.cumulativePercentage}%</span>
                    </div>
                  </div>

                  {/* Dual Bar (Occurrence + Cumulative Indicator) */}
                  <div className="w-full bg-[#0A0E15] h-3 border border-slate-800 relative flex items-center">
                    {/* Bar length */}
                    <div
                      className={`h-full transition-all ${
                        item.priority === 'CRITICAL' 
                          ? 'bg-red-600/80' 
                          : item.priority === 'HIGH' 
                          ? 'bg-orange-500/80' 
                          : 'bg-cyan-600/80'
                      }`}
                      style={{ width: `${item.percentage * 2}%` }}
                    />
                    {/* Cumulative Marker Pin */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${item.cumulativePercentage}%` }}
                      title={`Cumulative: ${item.cumulativePercentage}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 mt-3 font-mono">
            <span>Cumulative 80% cutoff: TK101_Level</span>
            <span className="text-amber-400">Amber line: Cumulative %</span>
          </div>
        </div>

        {/* Chart 2: Time-Series Line / Area (Spikes during plant trips) */}
        <div className="bg-[#121822] border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Alarm Frequency Over Time ({timeRange})
              </div>
              <div className="text-[11px] text-slate-400">
                Tracks operator rate vs. ISA-18.2 flood threshold (Trip spike visible)
              </div>
            </div>
            <span className="text-[10px] font-mono bg-red-950/70 border border-red-700 text-red-300 px-1.5 py-0.5">
              TRIP SPIKE
            </span>
          </div>

          {/* Time Series SVG Canvas */}
          <div className="relative h-48 w-full flex items-end pt-4 pb-6 px-4 bg-[#090D14] border border-slate-800">
            {/* Flood threshold horizontal dashed line (e.g. 10 alarms) */}
            <div 
              className="absolute left-0 right-0 border-b border-dashed border-red-500/60 z-10 flex items-center justify-end pr-2"
              style={{ bottom: `${(10 / maxTimeSeriesValue) * 100}%` }}
            >
              <span className="text-[9px] font-mono text-red-400 bg-[#090D14] px-1 -mb-3">
                FLOOD THRESHOLD (&gt;10)
              </span>
            </div>

            {/* Bars / Points */}
            <div className="w-full h-full flex items-end justify-between gap-1 z-20">
              {timeSeriesData.map((bucket, i) => {
                const heightPercent = Math.max((bucket.total / maxTimeSeriesValue) * 100, 4);
                const isTrip = !!bucket.tripMarker;
                const isOverFlood = bucket.total > 10;

                return (
                  <div
                    key={bucket.timeLabel}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ label: bucket.timeLabel, total: bucket.total, trip: bucket.tripMarker })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Plant Trip Marker Tag */}
                    {isTrip && (
                      <div className="absolute top-1 bg-red-900 border border-red-500 text-red-200 text-[9px] font-mono px-1 py-0.5 rounded-none whitespace-nowrap animate-bounce z-30">
                        ▲ {bucket.tripMarker}
                      </div>
                    )}

                    {/* Stacked or Single Bar */}
                    <div 
                      className={`w-full transition-all duration-200 ${
                        isOverFlood 
                          ? 'bg-gradient-to-t from-red-700 via-orange-600 to-red-500 border-t-2 border-red-300' 
                          : 'bg-gradient-to-t from-cyan-950 via-cyan-800 to-cyan-500 hover:from-cyan-900 hover:to-cyan-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* X-axis Label */}
                    <span className="absolute -bottom-5 text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 whitespace-nowrap">
                      {bucket.timeLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 bg-slate-900 border border-cyan-500 text-xs px-2.5 py-1 z-40 font-mono shadow-lg">
                <span className="text-slate-400">{hoveredPoint.label}: </span>
                <strong className="text-cyan-300">{hoveredPoint.total} alarms</strong>
                {hoveredPoint.trip && <div className="text-red-400 text-[11px]">Event: {hoveredPoint.trip}</div>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-2 font-mono">
            <span className="text-red-400">--- Dotted Line: Flood Threshold (&gt;10 alarms/10m)</span>
            <span>Spike caused by Steam Boiler Trip at 06:00</span>
          </div>
        </div>
      </div>

      {/* 4. Historical Alarms Table */}
      <div className="bg-[#121822] border border-slate-800 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Historical Alarm Log
            </span>
            <span className="text-[11px] text-slate-400">
              (Showing resolved and cleared events with duration)
            </span>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1 text-xs font-mono">
            <span className="text-slate-400">Filter:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-0.5 text-[10px] ${
                  filterPriority === p ? 'bg-cyan-900 text-cyan-200 font-bold border border-cyan-600' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0D131C] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold font-mono text-[11px]">
                <th className="p-2.5 w-24">Priority</th>
                <th className="p-2.5 w-36">Tag Name</th>
                <th className="p-2.5">Fault Description</th>
                <th className="p-2.5 w-36 font-mono-numbers">Time In</th>
                <th className="p-2.5 w-36 font-mono-numbers">Time Out</th>
                <th className="p-2.5 w-28 font-mono-numbers">Duration</th>
                <th className="p-2.5 w-36">Operator Ack</th>
                <th className="p-2.5 w-24 text-center">Chatter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#151D28] transition-colors">
                  <td className="p-2.5">
                    {renderPriorityBadge(rec.priority)}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-slate-200">
                    {rec.tagName}
                  </td>
                  <td className="p-2.5 text-slate-300">
                    {rec.description}
                  </td>
                  <td className="p-2.5 font-mono-numbers text-slate-400 whitespace-nowrap">
                    {rec.timeIn}
                  </td>
                  <td className="p-2.5 font-mono-numbers text-slate-400 whitespace-nowrap">
                    {rec.timeOut}
                  </td>
                  <td className="p-2.5 font-mono-numbers text-cyan-300 font-semibold whitespace-nowrap">
                    {rec.durationFormatted}
                  </td>
                  <td className="p-2.5 font-mono text-slate-400 text-[11px]">
                    {rec.operatorAck}
                  </td>
                  <td className="p-2.5 text-center">
                    {rec.chatteringDetected ? (
                      <span className="px-1.5 py-0.5 bg-amber-950/70 border border-amber-600 text-amber-300 text-[10px] font-bold font-mono">
                        CHATTER
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
