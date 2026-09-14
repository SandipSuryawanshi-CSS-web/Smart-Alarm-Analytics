import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ActiveAlarm, 
  HistoricalAlarm, 
  SystemEvent, 
  ISA182Metrics 
} from '../types/alarm';
import { 
  INITIAL_ACTIVE_ALARMS, 
  MOCK_HISTORICAL_ALARMS, 
  MOCK_SYSTEM_EVENTS, 
  MOCK_ISA_METRICS 
} from '../data/mockData';
import { TopBanner } from './TopBanner';
import { Sidebar, DashboardTab } from './Sidebar';
import { ActiveAlarmsTab } from './ActiveAlarmsTab';
import { HistoricalAlarmsTab } from './HistoricalAlarmsTab';
import { EventLogTab } from './EventLogTab';

export const AlarmDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('ACTIVE');
  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>(INITIAL_ACTIVE_ALARMS);
  const [historicalAlarms, setHistoricalAlarms] = useState<HistoricalAlarm[]>(MOCK_HISTORICAL_ALARMS);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>(MOCK_SYSTEM_EVENTS);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Audio Context Ref for ISA-18.2 Warning Chime
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator for industrial alarm horn
  const playAlarmTone = useCallback((isCritical: boolean) => {
    if (audioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isCritical ? 440 : 520, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    } catch {
      // AudioContext might be blocked until first user interaction
    }
  }, [audioMuted]);

  // Derived Metrics
  const unackCount = activeAlarms.filter(a => a.status === 'UNACK_ALARM').length;
  const criticalCount = activeAlarms.filter(a => a.priority === 'CRITICAL').length;
  const highCount = activeAlarms.filter(a => a.priority === 'HIGH').length;
  const mediumCount = activeAlarms.filter(a => a.priority === 'MEDIUM').length;
  const lowCount = activeAlarms.filter(a => a.priority === 'LOW').length;

  const currentMetrics: ISA182Metrics = {
    ...MOCK_ISA_METRICS,
    unacknowledgedCount: unackCount,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  };

  // Periodic audible pulse if unacknowledged alarms exist
  useEffect(() => {
    if (unackCount > 0 && !audioMuted) {
      const interval = setInterval(() => {
        playAlarmTone(criticalCount > 0);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [unackCount, criticalCount, audioMuted, playAlarmTone]);

  // Acknowledge handler (ISA-18.2 compliant transition)
  const handleAcknowledge = (alarmIds: string[]) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // 1. Update active alarms to ACK_ALARM
    setActiveAlarms(prev =>
      prev.map(alarm => {
        if (alarmIds.includes(alarm.id)) {
          return {
            ...alarm,
            status: 'ACK_ALARM',
            acknowledgedBy: 'Operator_John',
            acknowledgedAt: timestampStr,
          };
        }
        return alarm;
      })
    );

    // 2. Append corresponding audit trail log in System Event Log
    const newAuditEvents: SystemEvent[] = alarmIds.map((id, index) => {
      const target = activeAlarms.find(a => a.id === id);
      return {
        id: `EVT-ACK-${Date.now()}-${index}`,
        timestamp: timestampStr,
        category: 'Setpoint Change', // Or operator action
        userId: 'Operator_John',
        userRole: 'Operator',
        nodeAffected: target ? target.tagName : id,
        actionDetails: `Operator acknowledged ${target?.priority || ''} alarm on ${target?.tagName || id} (${target?.description || ''})`,
      };
    });

    setSystemEvents(prev => [...newAuditEvents, ...prev]);
  };

  // Simulated live incoming PLC events from Redis stream
  useEffect(() => {
    if (!isSimulating) return;

    const simulationTags = [
      { tag: 'STEAM_HDR_P2', node: 'S7-1500_PLC_01 [Node 2]', desc: 'Aux Boiler Steam Header Low Pressure', pri: 'HIGH' as const, val: 28.4, lim: 32.0, unit: 'bar' },
      { tag: 'DISTILL_FEED_F1', node: 'S7-1500_PLC_02 [Node 4]', desc: 'Column Feed Differential Flow Rate Low', pri: 'MEDIUM' as const, val: 320.1, lim: 350.0, unit: 'm³/h' },
      { tag: 'FLARE_PILOT_UV', node: 'S7-1200_PLC_03 [Node 5]', desc: 'Flare Stack Pilot Burner UV Sensor Unstable', pri: 'CRITICAL' as const, val: 12.0, lim: 30.0, unit: '%' },
      { tag: 'COOLING_TWR_FAN2', node: 'S7-1200_PLC_04 [Node 3]', desc: 'Cooling Tower Fan 2 Vibration Warning', pri: 'LOW' as const, val: 5.6, lim: 5.0, unit: 'mm/s' },
    ];

    let cycle = 0;
    const interval = setInterval(() => {
      const candidate = simulationTags[cycle % simulationTags.length];
      cycle++;

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newAlarm: ActiveAlarm = {
        id: `ALM-${Date.now() % 10000}`,
        timestamp: timestampStr,
        priority: candidate.pri,
        tagName: candidate.tag,
        node: candidate.node,
        description: candidate.desc,
        processValue: candidate.val,
        tripLimit: candidate.lim,
        engineeringUnit: candidate.unit,
        status: 'UNACK_ALARM',
      };

      setActiveAlarms(prev => {
        // Prevent infinite table explosion: max 12 items
        const filtered = prev.filter(a => a.tagName !== candidate.tag);
        return [newAlarm, ...filtered.slice(0, 10)];
      });

      playAlarmTone(candidate.pri === 'CRITICAL');
    }, 12000); // Trigger every 12 seconds when simulation is enabled

    return () => clearInterval(interval);
  }, [isSimulating, playAlarmTone]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F14] text-slate-100 antialiased select-none font-sans">
      {/* 1. Top Industrial Telemetry & Summary Banner */}
      <TopBanner
        metrics={currentMetrics}
        audioMuted={audioMuted}
        onToggleAudio={() => setAudioMuted(!audioMuted)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onClearAllAck={() => handleAcknowledge(activeAlarms.filter(a => a.status === 'UNACK_ALARM').map(a => a.id))}
      />

      {/* 2. Main Body with Left Navigation & Center Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Navigation Menu */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          unackCount={unackCount}
          totalActiveCount={activeAlarms.length}
        />

        {/* Center Tab Workspace */}
        <main className="flex-1 p-4 overflow-y-auto bg-[#0E131C] space-y-4">
          {currentTab === 'ACTIVE' && (
            <ActiveAlarmsTab
              alarms={activeAlarms}
              onAcknowledge={handleAcknowledge}
            />
          )}

          {currentTab === 'HISTORICAL' && (
            <HistoricalAlarmsTab
              historicalAlarms={historicalAlarms}
              metrics={currentMetrics}
            />
          )}

          {currentTab === 'EVENTS' && (
            <EventLogTab
              events={systemEvents}
            />
          )}
        </main>
      </div>

      {/* 3. Bottom Status Bar (SCADA Standard) */}
      <footer className="bg-[#090D14] border-t border-slate-800/90 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            <span className="text-slate-300">SCADA PROTOCOL: OPC-UA over TLS 1.3</span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Buffer Engine: Redis v7.2-Cluster</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Frame Drop Rate: 0.00%</span>
        </div>

        <div className="flex items-center space-x-3">
          <span>ANSI/ISA-18.2-2016 State: <strong className="text-cyan-300">COMPLIANT</strong></span>
          <span className="text-slate-600">|</span>
          <span>Station ID: CR4-ET-B</span>
        </div>
      </footer>
    </div>
  );
};
