# ISA-18.2 Industrial SCADA Alarm and Event Management Dashboard

A modern, high-performance, dark-mode SCADA/HMI single-page application built with **React**, **Tailwind CSS**, and **Chart Visualizations**, strictly adhering to **ANSI/ISA-18.2-2016** (*Management of Alarm Systems for the Process Industries*).

Designed for control room operators managing high-speed telemetry buffered from **Siemens PLCs (S7-1200 / S7-1500)** via an in-memory **Redis stream buffer**.

---

## Quick Start (Zero Build Step)

You can launch and interact with the complete, live-simulated SCADA dashboard immediately:

1. Locate the file **`index.html`** in this directory: `d:\Learning Ai\index.html`.
2. Double-click or open it in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
3. The dashboard boots up instantly with:
   - Live PLC telemetry streaming simulation.
   - Interactive alarm acknowledgment with physical/HMI state transitions.
   - Dynamic ISA-18.2 KPI benchmarks.
   - Pareto bad-actor analysis & plant-trip flood time-series charts.
   - Cryptographic system event audit trail.

---

## Modular React Component Architecture

For integration into an existing **Next.js**, **Vite**, or **Create React App** project, all source files are organized under `src/`:

```
d:\Learning Ai/
├── index.html                    # Self-contained standalone runnable HMI dashboard
├── README.md                     # Documentation and ISA-18.2 design rationale
└── src/
    ├── types/
    │   └── alarm.ts              # TypeScript models for ISA-18.2 alarms, KPIs, and audit events
    ├── data/
    │   └── mockData.ts           # Realistic Siemens S7-1500 PLC tags & telemetry records
    ├── components/
    │   ├── TopBanner.tsx         # PLC telemetry, Redis buffer throughput, ISA-18.2 4-tier counters
    │   ├── Sidebar.tsx           # Industrial navigation console with shift & plant metadata
    │   ├── ActiveAlarmsTab.tsx   # Tab 1: Real-time grid, blinking unack states, bulk acknowledgment
    │   ├── HistoricalAlarmsTab.tsx # Tab 2: Time filter, Pareto bad-actor bar, trip flood time-series
    │   ├── EventLogTab.tsx       # Tab 3: Chronological non-alarm audit trail (21 CFR Part 11 compliant)
    │   └── AlarmDashboard.tsx    # Master container with state orchestration & audio horn chime
    ├── App.tsx                   # Top-level React App wrapper
    └── index.css                 # Industrial dark theme tokens, flash keyframes, and mono typography
```

---

## ISA-18.2 Compliance & Design Directives

### 1. High-Performance HMI Color Philosophy
- **Dark Control Room Canvas:** Deep slate `#0B0F14` and `#111822` to minimize eye fatigue during 12-hour shifts.
- **Strict Alarm Color Reservation:** High-contrast red (`#EF4444`) and orange (`#F97316`) are **strictly prohibited** on decorative UI elements and reserved exclusively for Critical (Priority 1) and High (Priority 2) alarm states.
- **Dual-Encoding for Accessibility:** In compliance with ISA-18.2 Clause 10, every alarm priority is identified by both a standardized color and a geometric shape:
  - **Critical:** Red Diamond (`◆`)
  - **High:** Orange Square (`■`)
  - **Medium:** Yellow Circle (`●`)
  - **Low:** Blue Inverted Triangle (`▼`)

### 2. Standard Alarm State Machine
- **Active / Unacknowledged (`UNACK_ALARM`):** Pulses/flashes at ~1.2 Hz with a high-contrast border and audible horn chime to command immediate operator attention.
- **Active / Acknowledged (`ACK_ALARM`):** Transitions to a solid, steady state once acknowledged by the operator, silencing the horn for that event while keeping the tag visibly active until the process variable returns within normal operating limits.
- **Auditing:** Every acknowledgment automatically logs a cryptographically timestamped entry into the **System Event Log**.

### 3. ISA-18.2 Benchmark Metrics (Clause 16)
- **Average Alarms / Hour:** Evaluated against the manageable target of `< 6.0 alarms / hour` per console operator (Table 2 of ISA-18.2).
- **Peak Alarms / 10 min:** Evaluated against the flood threshold of `> 10 alarms / 10 minutes`. When breached during a plant upset or trip, the system displays a `FLOOD DETECTED` indicator.
- **Pareto Bad-Actor Identification:** Top 5 frequent alarms identifying chattering tags (e.g., `PUMP02_Press` and `COMPR_VIB_X`) contributing to >80% of nuisance alarms.

---

## Features Breakdown

### Tab 1: Active Alarms (Real-Time)
- **Header KPIs:** Total Active Alarms, Unacknowledged Alarms (with pulsing beacon), and Critical Priority Alarms.
- **Live Data Grid:**
  - Checkbox selection for individual or bulk acknowledgment.
  - Formatted Timestamps (`YYYY-MM-DD HH:mm:ss`).
  - Color-coded Priority Badges with dual-encoded geometric icons.
  - Siemens PLC Tag Names (`TK101_Level`, `MTR04_Temp`, `PUMP02_Press`) with Node hardware addresses.
  - Process Value vs Trip Limit with engineering units (`%`, `bar`, `°C`, `mm/s`).
  - High-performance flashing indicator for unacknowledged alarms.
  - Bulk **"Acknowledge Selected"** action and single-click row **"ACK"** action.
  - Priority filter chips and live keyword search.

### Tab 2: Historical Alarms (Analytics & Metrics)
- **Time Windows:** `Last 1 Hour`, `Last 24 Hours`, and `Last 7 Days`.
- **KPI Cards:** Average Alarms/Hour (Target < 6), Peak Alarms/10 min, Chattering Tags count, and Mean Time to Acknowledge (MTTA) compliance rate.
- **Pareto Bad-Actor Chart:** Visualizes alarm occurrences and cumulative percentage curve (80/20 rule) to guide engineering deadband tuning.
- **Trip Spike Time-Series:** Displays alarm frequency over time with a dashed alarm flood threshold line (`>10`) and trip markers (e.g., *Boiler 2 Trip Flood*).
- **Historical Log Table:** Comprehensive record of resolved events with `Time In`, `Time Out`, and computed `Duration` (`00:14:22`).

### Tab 3: System Event Log (Audit Trail)
- Dedicated exclusively to tracking non-alarm state changes and operator interventions.
- Tracks:
  - `User Login` (Security & Shift Handover)
  - `Setpoint Change` (e.g., cooling setpoint adjusted from 45.0°C to 42.5°C)
  - `Agentic Recommendation` (AI-detected cavitation advising valve trim adjustments)
  - `Interlock Override` (Temporary bypass authorizations)
  - `Recipe Change` & `Calibration`
- Color-coded category tags and user roles (Human Operator vs Autonomous AI Agent).

---

## Audio Horn Simulation

The dashboard integrates the **Web Audio API** to generate authentic SCADA horn tones for Critical (880Hz sawtooth) and High (660Hz sine) alarms. The audio can be silenced or armed at any time using the master **"HORN ARMED / SILENCED"** toggle in the top banner.
