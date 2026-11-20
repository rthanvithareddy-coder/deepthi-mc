import React from 'react';
import {
  Activity,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Radio,
  ShieldCheck,
  Smartphone,
  TowerControl,
} from 'lucide-react';
import {
  COMPONENT_ORDER,
  CallFlowStep,
  GSM_COMPONENTS,
  GsmComponentId,
} from '../data/gsmData';

interface ComponentInspectorProps {
  selectedComponent: GsmComponentId;
  onSelectComponent: (id: GsmComponentId) => void;
  currentStep: CallFlowStep | null;
}

function getComponentIcon(id: GsmComponentId) {
  const cls = 'h-4 w-4';
  switch (id) {
    case 'ms':
      return <Smartphone className={cls} aria-hidden="true" />;
    case 'bts':
      return <Radio className={cls} aria-hidden="true" />;
    case 'bsc':
      return <TowerControl className={cls} aria-hidden="true" />;
    case 'msc':
      return <Cpu className={cls} aria-hidden="true" />;
    case 'hlr':
      return <Database className={cls} aria-hidden="true" />;
    case 'vlr':
      return <HardDrive className={cls} aria-hidden="true" />;
    case 'auc':
      return <ShieldCheck className={cls} aria-hidden="true" />;
    case 'eir':
      return <Activity className={cls} aria-hidden="true" />;
    case 'pstn':
      return <Globe className={cls} aria-hidden="true" />;
  }
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  selectedComponent,
  onSelectComponent,
  currentStep,
}) => {
  const info = GSM_COMPONENTS[selectedComponent];
  const isErrorInStep =
    currentStep?.errorNodes?.some((nid) => info.diagramNodeIds.includes(nid)) ?? false;
  const isActiveInStep =
    currentStep?.activeNodes.some((nid) => info.diagramNodeIds.includes(nid)) ?? false;

  return (
    <section
      id="components"
      aria-label="GSM Network Component Information"
      className="flex flex-col rounded-xl border border-slate-700/60 bg-slate-900/65 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
            Network Component Information
          </h2>
          <p className="text-xs text-slate-400">
            Select any GSM subsystem entity to inspect role, interfaces, and protocols
          </p>
        </div>

        <span
          className={`font-mono text-xs font-semibold ${
            isErrorInStep
              ? 'text-rose-300'
              : isActiveInStep
              ? 'text-cyan-300'
              : 'text-slate-400'
          }`}
        >
          {isErrorInStep
            ? 'Fault / Rejected in Step'
            : isActiveInStep
            ? 'Active in Current Step'
            : 'Standby'}
        </span>
      </div>

      {/* 9-Component Interactive Selector Bar */}
      <div
        className="grid grid-cols-3 gap-1.5 border-b border-slate-800/80 bg-slate-950/40 p-3 sm:grid-cols-5 lg:grid-cols-9"
        role="tablist"
        aria-label="GSM network components"
      >
        {COMPONENT_ORDER.map((compId) => {
          const comp = GSM_COMPONENTS[compId];
          const isSelected = compId === selectedComponent;
          const isStepActive =
            currentStep?.activeNodes.some((nid) => comp.diagramNodeIds.includes(nid)) ?? false;

          return (
            <button
              key={compId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectComponent(compId)}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap ${
                isSelected
                  ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-100'
                  : isStepActive
                  ? 'border-blue-500/50 bg-blue-500/15 text-blue-200 hover:border-cyan-400/50'
                  : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {getComponentIcon(compId)}
              <span>{comp.acronym}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Component Details */}
      <div className="space-y-5 p-4 sm:p-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-cyan-300">{info.subsystem}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{info.interfaces.join(' / ')}</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-100">
            {info.name} ({info.acronym})
          </h3>
          <p className="text-sm leading-relaxed text-slate-300">{info.summary}</p>
        </div>

        <div className="grid gap-5 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold tracking-wide text-slate-300">
              Function &amp; Role
            </h4>
            <p className="text-sm leading-relaxed text-slate-400">
              {info.roleAndFunction}
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold tracking-wide text-slate-300">
              How It Communicates
            </h4>
            <p className="text-sm leading-relaxed text-slate-400">
              {info.communicationPath}
            </p>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-slate-300">
              Protocols &amp; Standards
            </h4>
            <p className="font-mono text-xs leading-relaxed text-cyan-200/90">
              {info.protocols}
            </p>
          </div>

          <div>
            <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-slate-300">
              Key Identifiers &amp; Elements
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              {info.keyIdentifiers.join(' · ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
