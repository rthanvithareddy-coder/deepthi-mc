import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Network,
  PhoneCall,
  Radio,
  Signal,
} from 'lucide-react';
import { ActivityLogPanel } from './components/ActivityLogPanel';
import { ComponentInspector } from './components/ComponentInspector';
import { NetworkArchitectureDiagram } from './components/NetworkArchitectureDiagram';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SimulationControlsPanel } from './components/SimulationControlsPanel';
import {
  ActivityLogEntry,
  DiagramNodeId,
  GSM_COMPONENTS,
  GsmComponentId,
  SimulationScenario,
  getScenarioSteps,
} from './data/gsmData';

function formatTimestampNow() {
  const now = new Date();
  return now.toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getSignalQualityLabel(dbm: number) {
  if (dbm >= -65) return { label: 'Excellent', bars: 4 };
  if (dbm >= -75) return { label: 'Good', bars: 3 };
  if (dbm >= -90) return { label: 'Fair', bars: 2 };
  return { label: 'Critical Fade', bars: 1 };
}

export default function App() {
  const [selectedComponent, setSelectedComponent] = useState<GsmComponentId>('msc');
  const [hoveredNode, setHoveredNode] = useState<DiagramNodeId | null>(null);
  const [scenario, setScenario] = useState<SimulationScenario>('normal');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [animateNetworkSignals, setAnimateNetworkSignals] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([
    {
      id: 'init-1',
      timestamp: formatTimestampNow(),
      stepNumber: null,
      category: 'system',
      interfaceName: 'NETWORK',
      message: 'GSM PLMN ready. All 9 core & radio entities initialized in standby.',
    },
  ]);

  const steps = useMemo(() => getScenarioSteps(scenario), [scenario]);
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] ?? null : null;
  const lastLoggedStepRef = useRef<string | null>(null);

  const appendLog = useCallback(
    (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
      setLogs((prev) => [
        {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: formatTimestampNow(),
        },
        ...prev.slice(0, 49),
      ]);
    },
    []
  );

  // Record step transitions in the activity log
  useEffect(() => {
    if (!currentStep) {
      lastLoggedStepRef.current = null;
      return;
    }
    const key = `${scenario}-${currentStep.stepNumber}-${currentStep.statusLabel}`;
    if (lastLoggedStepRef.current === key) return;
    lastLoggedStepRef.current = key;

    appendLog({
      stepNumber: currentStep.stepNumber,
      category: currentStep.statusCategory === 'error' ? 'alert' : 'signaling',
      interfaceName: currentStep.protocolLayer,
      message: `${currentStep.title}: ${currentStep.protocolMessage}`,
    });
  }, [currentStep, scenario, appendLog]);

  // Auto-advance simulation steps while playing
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const baseDelay = currentStep?.statusCategory === 'connected' ? 3200 : 2100;
    const delayMs = Math.round(baseDelay / speed);

    const timer = window.setTimeout(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length - 1) {
          setIsPlaying(false);
        }
        return Math.min(next, steps.length - 1);
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, speed, currentStep?.statusCategory]);

  // Call timer ticks during active call setup & connected phases until terminated/error
  useEffect(() => {
    if (currentStepIndex < 0) return;
    if (
      currentStep?.statusCategory === 'terminating' ||
      currentStep?.statusCategory === 'error'
    ) {
      return;
    }

    const shouldTick = isPlaying || currentStep?.statusCategory === 'connected';
    if (!shouldTick) return;

    const interval = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPlaying, currentStepIndex, currentStep?.statusCategory]);

  const handleStartCall = useCallback(() => {
    setCallSeconds(0);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleResume = useCallback(() => {
    if (currentStepIndex < 0) {
      setCurrentStepIndex(0);
    }
    if (currentStepIndex < steps.length - 1) {
      setIsPlaying(true);
    }
  }, [currentStepIndex, steps.length]);

  const handleNextStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const handlePrevStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleResetSimulation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setCallSeconds(0);
    lastLoggedStepRef.current = null;
    appendLog({
      stepNumber: null,
      category: 'system',
      interfaceName: 'RESET',
      message: 'Simulation reset. All radio and core switching channels returned to standby.',
    });
  }, [appendLog]);

  const handleSelectStep = useCallback((idx: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(idx);
  }, []);

  const handleTriggerScenario = useCallback(
    (nextScenario: SimulationScenario) => {
      setScenario(nextScenario);
      setCallSeconds(0);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      lastLoggedStepRef.current = null;
      const labelMap: Record<SimulationScenario, string> = {
        normal: 'Standard 12-Step Call Flow',
        busy_receiver: 'Busy Receiver Scenario (Cause #17)',
        auth_failure: 'Authentication Failure Scenario (Cause #21)',
        call_failure: 'Radio Congestion / Call Failure Scenario (Cause #34)',
      };
      appendLog({
        stepNumber: null,
        category: nextScenario === 'normal' ? 'system' : 'alert',
        interfaceName: 'SCENARIO',
        message: `Started ${labelMap[nextScenario]}.`,
      });
    },
    [appendLog]
  );

  const handleSelectComponent = useCallback(
    (id: GsmComponentId) => {
      setSelectedComponent(id);
      const comp = GSM_COMPONENTS[id];
      appendLog({
        stepNumber: null,
        category: 'system',
        interfaceName: comp.acronym,
        message: `Inspected ${comp.name} (${comp.interfaces.join(', ')}).`,
      });
    },
    [appendLog]
  );

  const handleToggleNetworkSignals = useCallback(() => {
    setAnimateNetworkSignals((prev) => {
      const next = !prev;
      appendLog({
        stepNumber: null,
        category: 'system',
        interfaceName: 'LINKS',
        message: next
          ? 'Continuous network link signal animation enabled.'
          : 'Continuous network link signal animation paused.',
      });
      return next;
    });
  }, [appendLog]);

  const handleResetNetworkSignals = useCallback(() => {
    setAnimateNetworkSignals(false);
    setHoveredNode(null);
    appendLog({
      stepNumber: null,
      category: 'system',
      interfaceName: 'LINKS',
      message: 'Network link animations reset to static architectural view.',
    });
  }, [appendLog]);

  const signalDbm = currentStep ? currentStep.signalStrengthDbm : -68;
  const signalQuality = getSignalQualityLabel(signalDbm);
  const activeConnections = currentStep
    ? currentStep.activeConnectionsCount
    : animateNetworkSignals
    ? 11
    : 0;

  const networkStatus = useMemo(() => {
    if (currentStep?.statusCategory === 'error') {
      return {
        label: currentStep.statusLabel,
        sub: 'Fault Detected',
        tone: 'text-rose-300',
        icon: <AlertTriangle className="h-4 w-4 text-rose-400" aria-hidden="true" />,
      };
    }
    if (currentStep?.statusCategory === 'connected') {
      return {
        label: 'Voice Active',
        sub: 'Full-Duplex TCH',
        tone: 'text-emerald-300',
        icon: <PhoneCall className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
      };
    }
    if (currentStep) {
      return {
        label: currentStep.statusLabel,
        sub: `Step ${currentStep.stepNumber} of ${steps.length}`,
        tone: 'text-cyan-300',
        icon: <Activity className="h-4 w-4 text-cyan-400" aria-hidden="true" />,
      };
    }
    return {
      label: 'Operational',
      sub: 'Standby PLMN',
      tone: 'text-cyan-300',
      icon: <CheckCircle2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />,
    };
  }, [currentStep, steps.length]);

  const formattedTimer = `${Math.floor(callSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(callSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#060b18] pb-16 text-slate-100 md:pb-8">
      {/* Top Bar Contract: Zone 1 Brand — Zone 2 4-5 nav links — Zone 3 1 primary CTA */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#060b18]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3 sm:px-6">
          <a
            href="#overview"
            className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 sm:text-lg"
          >
            GSM Simulator
          </a>

          <nav
            aria-label="Primary dashboard sections"
            className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex"
          >
            <a href="#overview" className="transition-colors hover:text-cyan-300 whitespace-nowrap shrink-0">
              Overview
            </a>
            <a href="#architecture" className="transition-colors hover:text-cyan-300 whitespace-nowrap shrink-0">
              Architecture
            </a>
            <a href="#simulation" className="transition-colors hover:text-cyan-300 whitespace-nowrap shrink-0">
              Call Flow
            </a>
            <a href="#components" className="transition-colors hover:text-cyan-300 whitespace-nowrap shrink-0">
              Components
            </a>
            <a href="#activity-log" className="transition-colors hover:text-cyan-300 whitespace-nowrap shrink-0">
              Activity Log
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={isPlaying ? handlePause : handleStartCall}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0"
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              {isPlaying ? 'Pause Call' : 'Start Call'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 pt-5 sm:px-6 sm:pt-6">
        {/* Overview & Live Network Telemetry Strip */}
        <section id="overview" className="space-y-4">
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 backdrop-blur-md sm:p-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-cyan-300">2G Cellular Architecture</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">900 / 1800 MHz TDMA</span>
                <span aria-hidden="true">·</span>
                <span>Unified Interactive Lab</span>
              </div>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
                GSM Network Architecture &amp; Call Flow Simulator
              </h1>
              <p className="text-sm leading-relaxed text-slate-300">
                Explore how Mobile Stations, radio towers, core switching, subscriber databases, and PSTN trunks collaborate in real time to authenticate, route, connect, and release mobile voice calls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <PWAInstallButton />
            </div>
          </div>

          {/* 4-Column Live Network Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Network Status</span>
                {networkStatus.icon}
              </div>
              <p className={`mt-2 text-base font-semibold sm:text-lg ${networkStatus.tone}`}>
                {networkStatus.label}
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-400">{networkStatus.sub}</p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Signal Strength (RxLev)</span>
                <Signal className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="font-mono text-base font-semibold text-slate-100 tabular-nums sm:text-lg">
                  {signalDbm} dBm
                </p>
                <div className="flex items-end gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className={`w-1 rounded-xs ${
                        bar <= signalQuality.bars
                          ? signalDbm < -90
                            ? 'bg-rose-400'
                            : 'bg-cyan-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ height: `${bar * 3 + 3}px` }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-0.5 font-mono text-xs text-slate-400">{signalQuality.label} RF Link</p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Connections</span>
                <Network className="h-4 w-4 text-blue-400" aria-hidden="true" />
              </div>
              <p className="mt-2 font-mono text-base font-semibold text-slate-100 tabular-nums sm:text-lg">
                {activeConnections} {activeConnections === 1 ? 'Link' : 'Links'}
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-400">
                {currentStep ? currentStep.protocolLayer : animateNetworkSignals ? 'All Interfaces' : 'Idle'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Call Timer &amp; State</span>
                <Radio className="h-4 w-4 text-purple-400" aria-hidden="true" />
              </div>
              <p className="mt-2 font-mono text-base font-semibold text-cyan-300 tabular-nums sm:text-lg">
                {formattedTimer}
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-400">
                {scenario === 'normal' ? 'Standard Call' : scenario.replace('_', ' ')}
              </p>
            </div>
          </div>
        </section>

        {/* Primary Unified Workspace: Interactive Architecture Diagram + Call Flow Simulation Controls */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <NetworkArchitectureDiagram
              selectedComponent={selectedComponent}
              onSelectComponent={handleSelectComponent}
              hoveredNode={hoveredNode}
              onHoverNode={setHoveredNode}
              currentStep={currentStep}
              animateNetworkSignals={animateNetworkSignals}
              onToggleNetworkSignals={handleToggleNetworkSignals}
              onResetNetworkSignals={handleResetNetworkSignals}
              zoom={zoom}
              onZoomIn={() => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
              onZoomOut={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              onResetZoom={() => setZoom(1)}
            />
          </div>

          <div className="xl:col-span-5">
            <SimulationControlsPanel
              scenario={scenario}
              steps={steps}
              currentStepIndex={currentStepIndex}
              isPlaying={isPlaying}
              callSeconds={callSeconds}
              speed={speed}
              onStartCall={handleStartCall}
              onPause={handlePause}
              onResume={handleResume}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onReset={handleResetSimulation}
              onSelectStep={handleSelectStep}
              onTriggerScenario={handleTriggerScenario}
              onChangeSpeed={setSpeed}
            />
          </div>
        </div>

        {/* Secondary Unified Dashboard Row: Component Inspector + Live Activity Log */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ComponentInspector
              selectedComponent={selectedComponent}
              onSelectComponent={handleSelectComponent}
              currentStep={currentStep}
            />
          </div>

          <div className="lg:col-span-5">
            <ActivityLogPanel
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>
        </div>
      </main>

      <footer className="mx-auto mt-10 max-w-[1440px] border-t border-slate-800/70 px-4 py-6 text-xs text-slate-500 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p>
            GSM Network Architecture &amp; Call Flow Simulator · Interactive Telecom Education Dashboard
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#architecture" className="hover:text-slate-300">Architecture</a>
            <a href="#simulation" className="hover:text-slate-300">Call Flow</a>
            <a href="#components" className="hover:text-slate-300">Components</a>
            <a href="#activity-log" className="hover:text-slate-300">Activity Log</a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Quick-Jump Navigation (<= 52px height, strictly under 15% mobile sticky cap) */}
      <nav
        aria-label="Mobile section navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex h-[52px] items-center justify-around border-t border-slate-800 bg-[#060b18]/95 px-2 backdrop-blur-md md:hidden"
      >
        <a
          href="#architecture"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 text-xs font-medium text-slate-300 active:text-cyan-300"
        >
          <Network className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          Diagram
        </a>
        <a
          href="#simulation"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 text-xs font-medium text-slate-300 active:text-cyan-300"
        >
          <PhoneCall className="h-4 w-4 text-blue-400" aria-hidden="true" />
          Simulate
        </a>
        <a
          href="#components"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 text-xs font-medium text-slate-300 active:text-cyan-300"
        >
          <Cpu className="h-4 w-4 text-purple-400" aria-hidden="true" />
          Nodes
        </a>
        <a
          href="#activity-log"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 text-xs font-medium text-slate-300 active:text-cyan-300"
        >
          <Layers className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          Log
        </a>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
