/**
 * ISA-18.2 Standard Alarm & Event Management Types
 * Specifically modeled for SCADA / Industrial Automation HMIs connected to Siemens PLCs via Redis buffers.
 */

export type AlarmPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlarmState = 
  | 'UNACK_ALARM'       // Active, Unacknowledged (Flashing/Blinking)
  | 'ACK_ALARM'         // Active, Acknowledged (Solid)
  | 'UNACK_RTN'         // Cleared / Returned to Normal, but Unacknowledged
  | 'SHELVED'           // Temporarily suppressed per operator action
  | 'SUPPRESSED_BY_LOGIC'; // Suppressed by PLC interlock

export type PlantTripStatus = 'NORMAL' | 'UPSET' | 'ALARM_FLOOD';

export interface ActiveAlarm {
  id: string;
  timestamp: string;
  priority: AlarmPriority;
  tagName: string;
  node: string;
  description: string;
  processValue: number;
  tripLimit: number;
  engineeringUnit: string;
  status: AlarmState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  selected?: boolean;
}

export interface HistoricalAlarm {
  id: string;
  tagName: string;
  node: string;
  description: string;
  priority: AlarmPriority;
  timeIn: string;
  timeOut: string;
  durationSeconds: number;
  durationFormatted: string;
  tripValue: number;
  engineeringUnit: string;
  operatorAck: string;
  chatteringDetected: boolean;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  category: 'User Login' | 'Setpoint Change' | 'Agentic Recommendation' | 'Interlock Override' | 'Recipe Change' | 'Calibration';
  userId: string;
  userRole: 'Operator' | 'Process Engineer' | 'AI Agent' | 'Safety System' | 'Supervisor';
  actionDetails: string;
  previousValue?: string;
  newValue?: string;
  nodeAffected?: string;
}

export interface ISA182Metrics {
  averageAlarmsPerHour: number; // Target: < 6 per ISA-18.2 Clause 16
  peakAlarms10Min: number;      // Flood Threshold: > 10 per 10 min
  totalAlarmsPeriod: number;
  unacknowledgedCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  percentAckUnder5Min: number;
  chatteringAlarmsCount: number;
}

export interface FrequentAlarmPareto {
  tagName: string;
  description: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
  priority: AlarmPriority;
}

export interface TimeSeriesAlarmBucket {
  timeLabel: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  tripMarker?: string;
}

export type TimeRangeFilter = '1H' | '24H' | '7D';
