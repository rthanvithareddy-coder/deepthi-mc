import React from 'react';
import {
  Activity,
  Cpu,
  Database,
  Globe,
  HardDrive,
  PhoneCall,
  Radio,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  TowerControl,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CallFlowStep,
  DIAGRAM_LINKS,
  DIAGRAM_NODES,
  DiagramNodeConfig,
  DiagramNodeId,
  GSM_COMPONENTS,
  GsmComponentId,
} from '../data/gsmData';

interface NetworkArchitectureDiagramProps {
  selectedComponent: GsmComponentId;
  onSelectComponent: (id: GsmComponentId) => void;
  hoveredNode: DiagramNodeId | null;
  onHoverNode: (id: DiagramNodeId | null) => void;
  currentStep: CallFlowStep | null;
  animateNetworkSignals: boolean;
  onToggleNetworkSignals: () => void;
  onResetNetworkSignals: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const ACCENT_HEX: Record<'cyan' | 'blue' | 'purple', { stroke: string; fill: string; text: string }> = {
  cyan: {
    stroke: '#22d3ee',
    fill: 'rgba(34, 211, 238, 0.14)',
    text: '#67e8f9',
  },
  blue: {
    stroke: '#3b82f6',
    fill: 'rgba(59, 130, 246, 0.14)',
    text: '#93c5fd',
  },
  purple: {
    stroke: '#a855f7',
    fill: 'rgba(168, 85, 247, 0.14)',
    text: '#d8b4fe',
  },
};

function renderNodeIcon(componentId: GsmComponentId, color: string) {
  const props = { width: 18, height: 18, stroke: color, strokeWidth: 2 };
  switch (componentId) {
    case 'ms':
      return <Smartphone {...props} />;
    case 'bts':
      return <Radio {...props} />;
    case 'bsc':
      return <TowerControl {...props} />;
    case 'msc':
      return <Cpu {...props} />;
    case 'hlr':
      return <Database {...props} />;
    case 'vlr':
      return <HardDrive {...props} />;
    case 'auc':
      return <ShieldCheck {...props} />;
    case 'eir':
      return <Activity {...props} />;
    case 'pstn':
      return <Globe {...props} />;
  }
}

export const NetworkArchitectureDiagram: React.FC<NetworkArchitectureDiagramProps> = ({
  selectedComponent,
  onSelectComponent,
  hoveredNode,
  onHoverNode,
  currentStep,
  animateNetworkSignals,
  onToggleNetworkSignals,
  onResetNetworkSignals,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const selectedNodeIds = GSM_COMPONENTS[selectedComponent].diagramNodeIds;
  const focusNodeIds = hoveredNode ? [hoveredNode] : selectedNodeIds;

  const isLinkHighlightedBySelection = (from: DiagramNodeId, to: DiagramNodeId) => {
    return focusNodeIds.includes(from) || focusNodeIds.includes(to);
  };

  const getNodeState = (node: DiagramNodeConfig) => {
    const isError = currentStep?.errorNodes?.includes(node.id) ?? false;
    const isActiveInStep = currentStep?.activeNodes.includes(node.id) ?? false;
    const isSelected = node.componentId === selectedComponent;
    const isHovered = hoveredNode === node.id;
    const isNeighborHighlighted =
      hoveredNode !== null &&
      DIAGRAM_LINKS.some(
        (l) => (l.from === hoveredNode && l.to === node.id) || (l.to === hoveredNode && l.from === node.id)
      );

    return { isError, isActiveInStep, isSelected, isHovered, isNeighborHighlighted };
  };

  const isVoiceConnected = currentStep?.statusCategory === 'connected';
  const isRinging = currentStep?.statusCategory === 'ringing';
  const isTerminating = currentStep?.statusCategory === 'terminating';

  return (
    <section
      id="architecture"
      aria-label="Interactive GSM Network Architecture Diagram"
      className="flex flex-col rounded-xl border border-slate-700/60 bg-slate-900/65 backdrop-blur-md"
    >
      {/* Diagram Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
            GSM Network Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Tap any node to inspect its role and highlight connected telecom interfaces
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleNetworkSignals}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0 ${
              animateNetworkSignals
                ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            {animateNetworkSignals ? 'Pause Signals' : 'Animate Signals'}
          </button>

          <button
            type="button"
            onClick={onResetNetworkSignals}
            title="Reset network signal animations"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Links
          </button>

          <div
            className="flex items-center rounded-lg border border-slate-700/80 bg-slate-950/60 p-0.5"
            role="group"
            aria-label="Diagram zoom controls"
          >
            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom out diagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onResetZoom}
              title="Reset zoom to 100%"
              className="min-w-[50px] px-2 py-1 font-mono text-xs font-medium text-slate-300 transition-colors hover:text-cyan-300"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={onZoomIn}
              aria-label="Zoom in diagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable / Zoomable SVG Stage */}
      <div className="gsm-scroll relative w-full overflow-auto bg-[#070d1d]/80 p-3 sm:p-4">
        <div
          className="mx-auto transition-transform duration-200 ease-out"
          style={{
            width: `${Math.max(680, Math.round(980 * zoom))}px`,
            maxWidth: zoom <= 1 ? '100%' : 'none',
            minWidth: zoom > 1 ? `${Math.round(980 * zoom)}px` : '680px',
          }}
        >
          <svg
            viewBox="0 0 1120 560"
            className="h-auto w-full select-none"
            role="img"
            aria-label="Interactive GSM Network Architecture Diagram showing MS, BTS, BSC, MSC, HLR, VLR, AuC, EIR, and PSTN"
          >
            <defs>
              <pattern id="gsmGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" />
              </pattern>
              <filter id="glowCyan" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle technical coordinate grid */}
            <rect x="0" y="0" width="1120" height="560" rx="12" fill="url(#gsmGrid)" />

            {/* Subsystem Architectural Zones */}
            <g>
              {/* MS Zone */}
              <rect
                x="22"
                y="214"
                width="166"
                height="156"
                rx="12"
                fill="rgba(34, 211, 238, 0.03)"
                stroke="rgba(34, 211, 238, 0.2)"
                strokeDasharray="5 5"
              />
              <text x="34" y="234" fill="#67e8f9" fontSize="11" fontWeight="600" letterSpacing="0.03em">
                Mobile Station
              </text>

              {/* BSS Zone */}
              <rect
                x="198"
                y="214"
                width="330"
                height="156"
                rx="12"
                fill="rgba(59, 130, 246, 0.04)"
                stroke="rgba(59, 130, 246, 0.25)"
                strokeDasharray="5 5"
              />
              <text x="210" y="234" fill="#93c5fd" fontSize="11" fontWeight="600" letterSpacing="0.03em">
                Base Station Subsystem (BSS)
              </text>

              {/* NSS Core Zone */}
              <rect
                x="442"
                y="34"
                width="470"
                height="376"
                rx="14"
                fill="rgba(168, 85, 247, 0.03)"
                stroke="rgba(168, 85, 247, 0.24)"
                strokeDasharray="5 5"
              />
              <text x="458" y="56" fill="#d8b4fe" fontSize="11" fontWeight="600" letterSpacing="0.03em">
                Network &amp; Switching Subsystem (NSS)
              </text>

              {/* Terminating Cell & External Zone */}
              <rect
                x="760"
                y="214"
                width="338"
                height="156"
                rx="12"
                fill="rgba(34, 211, 238, 0.03)"
                stroke="rgba(34, 211, 238, 0.2)"
                strokeDasharray="5 5"
              />
              <text x="772" y="234" fill="#67e8f9" fontSize="11" fontWeight="600" letterSpacing="0.03em">
                Terminating BSS &amp; Receiver
              </text>

              {/* PSTN / Security Lower Strip Label */}
              <rect
                x="442"
                y="424"
                width="388"
                height="110"
                rx="12"
                fill="rgba(59, 130, 246, 0.03)"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeDasharray="5 5"
              />
              <text x="458" y="440" fill="#94a3b8" fontSize="10" fontWeight="600">
                Security Registry &amp; External PSTN Interconnect
              </text>
            </g>

            {/* Links & Signal Flows */}
            {DIAGRAM_LINKS.map((link) => {
              const activeLink = currentStep?.activeLinks.find((al) => al.linkId === link.id);
              const isHighlighted = isLinkHighlightedBySelection(link.from, link.to);
              const isError = activeLink?.isError ?? false;
              const isActive = !!activeLink;

              let baseStroke = 'rgba(100, 116, 139, 0.42)';
              let strokeWidth = 2;
              if (isError) {
                baseStroke = '#f43f5e';
                strokeWidth = 3;
              } else if (isActive) {
                baseStroke = isVoiceConnected ? '#22d3ee' : '#38bdf8';
                strokeWidth = 3;
              } else if (isHighlighted) {
                baseStroke = '#a855f7';
                strokeWidth = 2.5;
              }

              const animClass = isActive
                ? activeLink.direction === 'reverse'
                  ? 'animate-signal-reverse'
                  : 'animate-signal-forward'
                : animateNetworkSignals
                ? 'animate-signal-ambient'
                : '';

              const packetColor = isError ? '#fb7185' : isVoiceConnected ? '#22d3ee' : '#38bdf8';

              return (
                <g key={link.id}>
                  {/* Base hairline connector */}
                  <path
                    d={link.pathD}
                    fill="none"
                    stroke={baseStroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    opacity={isActive || isHighlighted ? 0.95 : 0.65}
                  />

                  {/* Animated flow overlay */}
                  {(isActive || animateNetworkSignals) && (
                    <path
                      d={link.pathD}
                      fill="none"
                      stroke={isError ? '#fda4af' : isActive ? '#67e8f9' : '#38bdf8'}
                      strokeWidth={isActive ? 3.2 : 2}
                      strokeLinecap="round"
                      className={animClass}
                      filter={isActive ? (isError ? 'url(#glowRed)' : 'url(#glowCyan)') : undefined}
                    />
                  )}

                  {/* Moving signal packet orb */}
                  {isActive && (
                    <>
                      <circle r={isVoiceConnected ? 5 : 4.5} fill={packetColor} filter="url(#glowCyan)">
                        <animateMotion
                          dur={isVoiceConnected ? '0.9s' : '1.2s'}
                          repeatCount="indefinite"
                          path={link.pathD}
                          keyPoints={activeLink.direction === 'reverse' ? '1;0' : '0;1'}
                          keyTimes="0;1"
                        />
                      </circle>
                      {activeLink.direction === 'bidirectional' && (
                        <circle r={4} fill="#c084fc" filter="url(#glowCyan)">
                          <animateMotion
                            dur="1.15s"
                            repeatCount="indefinite"
                            path={link.pathD}
                            keyPoints="1;0"
                            keyTimes="0;1"
                          />
                        </circle>
                      )}
                    </>
                  )}

                  {/* Interface pill label (unboxed crisp SVG badge for legibility over lines) */}
                  <g transform={`translate(${link.labelX}, ${link.labelY})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="18"
                      rx="4"
                      fill="#0a1224"
                      stroke={isError ? '#f43f5e' : isActive ? '#22d3ee' : isHighlighted ? '#a855f7' : '#1e293b'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="IBM Plex Mono, monospace"
                      fontWeight="600"
                      fill={isError ? '#fda4af' : isActive ? '#67e8f9' : isHighlighted ? '#e9d5ff' : '#94a3b8'}
                    >
                      {link.interfaceName}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Interactive GSM Nodes */}
            {DIAGRAM_NODES.map((node) => {
              const { isError, isActiveInStep, isSelected, isHovered, isNeighborHighlighted } = getNodeState(node);
              const palette = ACCENT_HEX[node.accent];
              const borderColor = isError
                ? '#f43f5e'
                : isActiveInStep
                ? '#22d3ee'
                : isSelected
                ? palette.stroke
                : isHovered || isNeighborHighlighted
                ? '#818cf8'
                : 'rgba(71, 85, 105, 0.7)';

              const bgFill = isError
                ? 'rgba(136, 19, 55, 0.45)'
                : isActiveInStep
                ? 'rgba(14, 116, 144, 0.28)'
                : isSelected
                ? palette.fill
                : 'rgba(15, 23, 42, 0.92)';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => onSelectComponent(node.componentId)}
                  onMouseEnter={() => onHoverNode(node.id)}
                  onMouseLeave={() => onHoverNode(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label} (${GSM_COMPONENTS[node.componentId].name}). Click to inspect component.`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectComponent(node.componentId);
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Ringing wave animation on receiver phone in Step 9 */}
                  {isRinging && node.id === 'ms-b' && (
                    <rect
                      x="-6"
                      y="-6"
                      width={node.width + 12}
                      height={node.height + 12}
                      rx="16"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      className="animate-ring-wave"
                    />
                  )}

                  {/* Active / Selected outer aura */}
                  {(isActiveInStep || isSelected || isError) && (
                    <rect
                      x="-3"
                      y="-3"
                      width={node.width + 6}
                      height={node.height + 6}
                      rx="14"
                      fill="none"
                      stroke={isError ? 'rgba(244, 63, 94, 0.5)' : isActiveInStep ? 'rgba(34, 211, 238, 0.45)' : 'rgba(168, 85, 247, 0.4)'}
                      strokeWidth="2"
                      filter={isError ? 'url(#glowRed)' : 'url(#glowCyan)'}
                    />
                  )}

                  {/* Node body */}
                  <rect
                    x="0"
                    y="0"
                    width={node.width}
                    height={node.height}
                    rx="11"
                    fill={bgFill}
                    stroke={borderColor}
                    strokeWidth={isActiveInStep || isSelected || isError ? 2 : 1.25}
                  />

                  {/* Icon container */}
                  <rect
                    x="10"
                    y="12"
                    width="30"
                    height="30"
                    rx="7"
                    fill="rgba(15, 23, 42, 0.85)"
                    stroke={borderColor}
                    strokeWidth="1"
                  />
                  <g transform="translate(16, 18)">
                    {renderNodeIcon(node.componentId, isError ? '#fda4af' : isActiveInStep ? '#67e8f9' : palette.text)}
                  </g>

                  {/* Labels */}
                  <text
                    x="48"
                    y="27"
                    fill="#f8fafc"
                    fontSize="12.5"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                  <text
                    x="48"
                    y="43"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {node.sublabel}
                  </text>

                  {/* Bottom state bar inside node */}
                  <text
                    x="10"
                    y={node.height - 10}
                    fontSize="9.5"
                    fontWeight="600"
                    fill={isError ? '#fda4af' : isActiveInStep ? '#67e8f9' : isSelected ? palette.text : '#64748b'}
                  >
                    {isError
                      ? 'FAULT / REJECT'
                      : isActiveInStep
                      ? isTerminating
                        ? 'RELEASING'
                        : isVoiceConnected
                        ? 'VOICE TCH'
                        : 'ACTIVE'
                      : isSelected
                      ? 'SELECTED'
                      : 'STANDBY'}
                  </text>
                </g>
              );
            })}

            {/* Voice Connection Established Banner inside SVG */}
            {isVoiceConnected && (
              <g transform="translate(360, 168)">
                <rect
                  x="0"
                  y="0"
                  width="400"
                  height="32"
                  rx="8"
                  fill="rgba(6, 182, 212, 0.16)"
                  stroke="#22d3ee"
                  strokeWidth="1.25"
                />
                <text
                  x="200"
                  y="20"
                  textAnchor="middle"
                  fill="#a5f3fc"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  FULL-DUPLEX VOICE CIRCUIT ACTIVE (MS-A &lt;==&gt; MS-B)
                </text>
              </g>
            )}

            {/* Call Termination Sweep Banner */}
            {isTerminating && (
              <g transform="translate(360, 168)">
                <rect
                  x="0"
                  y="0"
                  width="400"
                  height="32"
                  rx="8"
                  fill="rgba(168, 85, 247, 0.16)"
                  stroke="#a855f7"
                  strokeWidth="1.25"
                />
                <text
                  x="200"
                  y="20"
                  textAnchor="middle"
                  fill="#e9d5ff"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  RELEASING TCH CHANNELS &amp; RECORDING CDR
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Concise Diagram Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 px-4 py-2.5 text-xs text-slate-400 sm:px-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" aria-hidden="true" />
            Active Signal / Voice
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" aria-hidden="true" />
            BSS / Core Switching
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-purple-500" aria-hidden="true" />
            Subscriber &amp; Security DB
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" aria-hidden="true" />
            Fault / Rejection
          </span>
        </div>

        {currentStep && (
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-300">
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Step {currentStep.stepNumber}: {currentStep.protocolLayer}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
