import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Play,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { CallFlowStep, SimulationScenario } from '../data/gsmData';

interface SimulationControlsPanelProps {
  scenario: SimulationScenario;
  steps: CallFlowStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  callSeconds: number;
  speed: 0.5 | 1 | 2;
  onStartCall: () => void;
  onPause: () => void;
  onResume: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onSelectStep: (index: number) => void;
  onTriggerScenario: (scenario: SimulationScenario) => void;
  onChangeSpeed: (speed: 0.5 | 1 | 2) => void;
}

function formatTimer(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export const SimulationControlsPanel: React.FC<SimulationControlsPanelProps> = ({
  scenario,
  steps,
  currentStepIndex,
  isPlaying,
  callSeconds,
  speed,
  onStartCall,
  onPause,
  onResume,
  onNextStep,
  onPrevStep,
  onReset,
  onSelectStep,
  onTriggerScenario,
  onChangeSpeed,
}) => {
  const activeStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const totalSteps = steps.length;
  const isAtEnd = currentStepIndex >= totalSteps - 1;
  const progressPercent =
    currentStepIndex < 0 ? 0 : Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const getStatusDisplay = () => {
    if (!activeStep) {
      return {
        label: 'Idle · Ready to Dial',
        icon: <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />,
        tone: 'text-slate-300 border-slate-700/70 bg-slate-800/70',
      };
    }

    switch (activeStep.statusCategory) {
      case 'error':
        return {
          label: activeStep.statusLabel,
          icon: <AlertTriangle className="h-4 w-4 text-rose-400" aria-hidden="true" />,
          tone: 'text-rose-200 border-rose-500/50 bg-rose-950/50',
        };
      case 'connected':
        return {
          label: activeStep.statusLabel,
          icon: <PhoneCall className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
          tone: 'text-emerald-200 border-emerald-500/50 bg-emerald-950/40',
        };
      case 'ringing':
        return {
          label: activeStep.statusLabel,
          icon: <PhoneCall className="h-4 w-4 text-cyan-300" aria-hidden="true" />,
          tone: 'text-cyan-200 border-cyan-500/50 bg-cyan-950/40',
        };
      case 'terminating':
        return {
          label: activeStep.statusLabel,
          icon: <PhoneOff className="h-4 w-4 text-purple-300" aria-hidden="true" />,
          tone: 'text-purple-200 border-purple-500/50 bg-purple-950/40',
        };
      default:
        return {
          label: activeStep.statusLabel,
          icon: <CheckCircle2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />,
          tone: 'text-cyan-100 border-cyan-500/40 bg-cyan-950/35',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <section
      id="simulation"
      aria-label="Call Flow Simulation Controls and Step Explanation"
      className="flex flex-col rounded-xl border border-slate-700/60 bg-slate-900/65 backdrop-blur-md"
    >
      {/* Header & Call Status + Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
            Call Flow Simulator
          </h2>
          <p className="text-xs text-slate-400">
            12-step GSM mobile call setup, speech &amp; release
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${status.tone}`}>
            {status.icon}
            <span>{status.label}</span>
          </div>
          <div
            className="rounded-lg border border-slate-700/70 bg-slate-950/70 px-2.5 py-1.5 font-mono text-xs font-semibold text-cyan-300 tabular-nums"
            title="Active call / session timer"
          >
            {formatTimer(callSeconds)}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        {/* Primary Playback Controls */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {!isPlaying ? (
            <button
              type="button"
              onClick={currentStepIndex >= 0 && !isAtEnd ? onResume : onStartCall}
              className="col-span-2 inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              {currentStepIndex >= 0 && !isAtEnd ? 'Resume' : isAtEnd ? 'Restart Call' : 'Start Call'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="col-span-2 inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
            >
              <Pause className="h-4 w-4" aria-hidden="true" />
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={onPrevStep}
            disabled={currentStepIndex <= 0}
            className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>

          <button
            type="button"
            onClick={onNextStep}
            disabled={isAtEnd}
            className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>

          {/* Playback Speed */}
          <div
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/60 p-1"
            role="group"
            aria-label="Simulation speed"
          >
            {([0.5, 1, 2] as const).map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onChangeSpeed(rate)}
                className={`min-h-[34px] rounded-md px-2 font-mono text-xs font-medium transition-colors ${
                  speed === rate
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Failure & Mode Triggers */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Simulation Scenarios</span>
            <span className="font-mono text-[11px]">
              Active: {scenario === 'normal' ? 'Standard Call' : scenario.replace('_', ' ')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onTriggerScenario('normal')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                scenario === 'normal'
                  ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                  : 'border-slate-700/80 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Normal Call</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerScenario('busy_receiver')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                scenario === 'busy_receiver'
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                  : 'border-slate-700/80 bg-slate-800/50 text-slate-300 hover:border-amber-500/40 hover:text-amber-200'
              }`}
            >
              <PhoneMissed className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Busy Receiver</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerScenario('auth_failure')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                scenario === 'auth_failure'
                  ? 'border-rose-500/60 bg-rose-500/15 text-rose-200'
                  : 'border-slate-700/80 bg-slate-800/50 text-slate-300 hover:border-rose-500/40 hover:text-rose-200'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Auth Failure</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerScenario('call_failure')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                scenario === 'call_failure'
                  ? 'border-rose-500/60 bg-rose-500/15 text-rose-200'
                  : 'border-slate-700/80 bg-slate-800/50 text-slate-300 hover:border-rose-500/40 hover:text-rose-200'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Call Failure</span>
            </button>
          </div>
        </div>

        {/* Simulation Progress Bar + Interactive Step Strip */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Simulation Progress</span>
            <span className="font-mono text-slate-300 tabular-nums">
              Step {currentStepIndex < 0 ? 0 : currentStepIndex + 1} / {totalSteps} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                activeStep?.statusCategory === 'error'
                  ? 'bg-rose-500'
                  : activeStep?.statusCategory === 'connected'
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2.5 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              const isErr = step.isTerminalFailure;
              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => onSelectStep(idx)}
                  title={`Step ${step.stepNumber}: ${step.title}`}
                  className={`min-h-[32px] rounded-md border font-mono text-xs font-semibold transition-colors ${
                    isCurrent
                      ? isErr
                        ? 'border-rose-400 bg-rose-500/30 text-rose-100'
                        : 'border-cyan-400 bg-cyan-500/25 text-cyan-100'
                      : isPast
                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {step.stepNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Step Explanation */}
        <div className="flex-1 border-t border-slate-800/80 pt-4">
          {activeStep ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  Step {activeStep.stepNumber} of {totalSteps} · {activeStep.protocolLayer}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-100">
                {activeStep.title}
              </h3>

              <div className="rounded-lg border border-slate-800 bg-slate-950/75 px-3 py-2 font-mono text-xs text-cyan-200">
                {activeStep.protocolMessage}
              </div>

              <p className="text-sm leading-relaxed text-slate-300">
                {activeStep.explanation}
              </p>

              <ul className="space-y-1.5 text-xs text-slate-400">
                {activeStep.keyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-2.5 text-sm text-slate-300">
              <h3 className="text-base font-semibold text-slate-100">
                Ready to Simulate GSM Call Flow
              </h3>
              <p className="leading-relaxed text-slate-400">
                Press <strong className="text-cyan-300">Start Call</strong> to watch a complete 12-step cellular voice call propagate across MS, BTS, BSC, MSC, HLR, VLR, AuC, EIR, and PSTN — or choose a failure scenario above to test network error handling.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
