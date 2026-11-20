import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ActivityLogEntry } from '../data/gsmData';

interface ActivityLogPanelProps {
  logs: ActivityLogEntry[];
  onClearLogs: () => void;
}

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'signaling' | 'alert'>('all');

  const visibleLogs = logs.filter((entry) => {
    if (filter === 'all') return true;
    return entry.category === filter;
  });

  return (
    <section
      id="activity-log"
      aria-label="GSM Signaling Activity Log"
      className="flex flex-col rounded-xl border border-slate-700/60 bg-slate-900/65 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
            Network Activity Log
          </h2>
          <p className="text-xs text-slate-400">
            Real-time GSM signaling frames and simulation events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
            {(['all', 'signaling', 'alert'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`min-h-[34px] rounded-md px-2.5 text-xs font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-slate-800 text-cyan-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'alert' ? 'Alerts' : tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            aria-label="Clear activity log"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <div className="gsm-scroll max-h-[360px] flex-1 overflow-y-auto p-3 sm:p-4">
        {visibleLogs.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-300">No signaling events recorded</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Start a call simulation or click network components to observe protocol activity here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {visibleLogs.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-slate-500 tabular-nums">{entry.timestamp}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span
                      className={`font-mono font-semibold ${
                        entry.category === 'alert'
                          ? 'text-rose-400'
                          : entry.category === 'signaling'
                          ? 'text-cyan-300'
                          : 'text-purple-300'
                      }`}
                    >
                      {entry.interfaceName}
                    </span>
                    {entry.stepNumber !== null && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">Step {entry.stepNumber}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {entry.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
