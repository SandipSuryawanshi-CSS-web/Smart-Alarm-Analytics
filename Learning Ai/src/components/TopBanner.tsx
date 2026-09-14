import React, { useState, useEffect } from 'react';
import { ISA182Metrics } from '../types/alarm';

interface TopBannerProps {
  metrics: ISA182Metrics;
  audioMuted: boolean;
  onToggleAudio: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onClearAllAck: () => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({
  metrics,
  audioMuted,
  onToggleAudio,
  isSimulating,
  onToggleSimulation,
  onClearAllAck,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0D131C] border-b border-slate-800 px-4 py-2 text-slate-200 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding, Standard & Connection Telemetry */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-6 bg-cyan-500"></div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wider text-sm text-slate-100 uppercase">
                  SCADA HMI // ALARM MANAGEMENT
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-cyan-400 border border-slate-700 font-mono tracking-wider font-semibold">
                  ISA-18.2 COMPLIANT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Unit: <strong className="text-slate-300 font-normal">Ethylene Train B</strong></span>
                <span className="text-slate-600">|</span>
                <span>Console: <strong className="text-slate-300 font-normal">CR-04 (Lead Tech)</strong></span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-3 pl-4 border-l border-slate-800 text-xs font-mono-numbers">
            {/* Siemens PLC Telemetry */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 px-2.5 py-1 border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-slate-400">SIEMENS S7-1500:</span>
              <span className="text-[11px] text-emerald-400 font-semibold">ONLINE (9ms)</span>
            </div>

            {/* Redis Ring Buffer */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 px-2.5 py-1 border border-slate-800">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-none"></span>
              <span className="text-[11px] text-slate-400">REDIS BUFFER:</span>
              <span className="text-[11px] text-cyan-300 font-semibold">STREAM 1.2k msg/s</span>
            </div>
          </div>
        </div>

        {/* Center: ISA-18.2 4-Tier Alarm Counters */}
        <div className="flex items-center space-x-1 bg-[#090D14] p-1 border border-slate-800 text-xs">
          {/* Critical Counter */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 border ${metrics.criticalCount > 0 ? 'bg-red-950/40 border-red-700/60 text-red-300' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
            <span className="w-2.5 h-2.5 bg-red-600 rotate-45 transform inline-block flex-shrink-0"></span>
            <span className="text-[10px] font-bold tracking-wider">CRITICAL:</span>
            <span className="font-mono-numbers font-extrabold text-xs text-red-400">{metrics.criticalCount}</span>
          </div>

          {/* High Counter */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 border ${metrics.highCount > 0 ? 'bg-orange-950/40 border-orange-700/60 text-orange-300' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
            <span className="w-2.5 h-2.5 bg-orange-500 inline-block flex-shrink-0"></span>
            <span className="text-[10px] font-bold tracking-wider">HIGH:</span>
            <span className="font-mono-numbers font-extrabold text-xs text-orange-400">{metrics.highCount}</span>
          </div>

          {/* Medium Counter */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 border ${metrics.mediumCount > 0 ? 'bg-yellow-950/30 border-yellow-700/50 text-yellow-300' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block flex-shrink-0"></span>
            <span className="text-[10px] font-bold tracking-wider">MED:</span>
            <span className="font-mono-numbers font-extrabold text-xs text-yellow-300">{metrics.mediumCount}</span>
          </div>

          {/* Low Counter */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 border ${metrics.lowCount > 0 ? 'bg-blue-950/30 border-blue-700/50 text-blue-300' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
            <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-blue-400 inline-block flex-shrink-0"></span>
            <span className="text-[10px] font-bold tracking-wider">LOW:</span>
            <span className="font-mono-numbers font-extrabold text-xs text-blue-300">{metrics.lowCount}</span>
          </div>
        </div>

        {/* Right: Controls & Plant Clock */}
        <div className="flex items-center space-x-2">
          {/* Live PLC Stream Simulator Toggle */}
          <button
            onClick={onToggleSimulation}
            title="Simulate incoming PLC telemetry events over Redis stream"
            className={`px-2.5 py-1 text-xs border font-mono tracking-wider transition-colors flex items-center space-x-1.5 ${
              isSimulating 
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 hover:bg-cyan-900/70' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className={`w-2 h-2 ${isSimulating ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
            <span>SIMULATION: {isSimulating ? 'STREAMING' : 'PAUSED'}</span>
          </button>

          {/* Master Horn Silence Toggle */}
          <button
            onClick={onToggleAudio}
            className={`px-2.5 py-1 text-xs border transition-colors flex items-center space-x-1.5 font-medium ${
              audioMuted 
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700' 
                : 'bg-amber-950/50 border-amber-600 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Silence or Arm Audible Alarm Horn (ISA-18.2 Operator Control)"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              {audioMuted ? (
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
              ) : (
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.829 1 1 0 010-1.414z" />
              )}
            </svg>
            <span>{audioMuted ? 'HORN SILENCED' : 'HORN ARMED'}</span>
          </button>

          {/* Plant Master Clock */}
          <div className="bg-black/70 border border-slate-800 px-2.5 py-1 text-right font-mono-numbers">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">PLANT TIME (UTC+05:30)</div>
            <div className="text-xs font-semibold text-slate-200 tracking-wide leading-tight">{currentTime}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
