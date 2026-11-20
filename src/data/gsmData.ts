export type GsmComponentId =
  | 'ms'
  | 'bts'
  | 'bsc'
  | 'msc'
  | 'hlr'
  | 'vlr'
  | 'auc'
  | 'eir'
  | 'pstn';

export type DiagramNodeId =
  | 'ms-a'
  | 'bts-1'
  | 'bsc'
  | 'msc'
  | 'vlr'
  | 'hlr'
  | 'auc'
  | 'eir'
  | 'pstn'
  | 'bts-2'
  | 'ms-b';

export type SimulationScenario =
  | 'normal'
  | 'call_failure'
  | 'busy_receiver'
  | 'auth_failure';

export type StepStatusCategory =
  | 'idle'
  | 'setup'
  | 'security'
  | 'routing'
  | 'ringing'
  | 'connected'
  | 'terminating'
  | 'error';

export interface GsmComponentInfo {
  id: GsmComponentId;
  acronym: string;
  name: string;
  subsystem: 'Mobile Station' | 'Base Station Subsystem (BSS)' | 'Network & Switching Subsystem (NSS)' | 'External Network';
  accent: 'cyan' | 'blue' | 'purple';
  interfaces: string[];
  protocols: string;
  summary: string;
  roleAndFunction: string;
  communicationPath: string;
  keyIdentifiers: string[];
  diagramNodeIds: DiagramNodeId[];
}

export interface DiagramNodeConfig {
  id: DiagramNodeId;
  componentId: GsmComponentId;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: 'cyan' | 'blue' | 'purple';
}

export interface DiagramLinkConfig {
  id: string;
  from: DiagramNodeId;
  to: DiagramNodeId;
  interfaceName: string;
  pathD: string;
  labelX: number;
  labelY: number;
}

export interface ActiveLinkStep {
  linkId: string;
  direction: 'forward' | 'reverse' | 'bidirectional';
  isError?: boolean;
}

export interface CallFlowStep {
  stepNumber: number;
  title: string;
  statusLabel: string;
  statusCategory: StepStatusCategory;
  activeNodes: DiagramNodeId[];
  errorNodes?: DiagramNodeId[];
  activeLinks: ActiveLinkStep[];
  signalStrengthDbm: number;
  activeConnectionsCount: number;
  protocolLayer: string;
  protocolMessage: string;
  explanation: string;
  keyPoints: string[];
  isTerminalFailure?: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  stepNumber: number | null;
  category: 'signaling' | 'alert' | 'system';
  interfaceName: string;
  message: string;
}

export const GSM_COMPONENTS: Record<GsmComponentId, GsmComponentInfo> = {
  ms: {
    id: 'ms',
    acronym: 'MS',
    name: 'Mobile Station',
    subsystem: 'Mobile Station',
    accent: 'cyan',
    interfaces: ['Um (Air Interface)'],
    protocols: 'GSM 900/1800 TDMA · FDMA · LAPDm · RACH/SDCCH/TCH',
    summary: 'Subscriber handset and SIM card initiating or receiving voice calls over radio.',
    roleAndFunction:
      'Combines Mobile Equipment (ME) hardware with the Subscriber Identity Module (SIM). Performs RF modulation/demodulation, channel coding, ciphering (A5), and call control signaling.',
    communicationPath:
      'Communicates wirelessly with the serving Base Transceiver Station (BTS) over the Um air interface using TDMA timeslots.',
    keyIdentifiers: ['IMSI (Subscriber ID)', 'IMEI (Device Serial)', 'MSISDN (Phone Number)', 'Ki (Secret Auth Key)'],
    diagramNodeIds: ['ms-a', 'ms-b'],
  },
  bts: {
    id: 'bts',
    acronym: 'BTS',
    name: 'Base Transceiver Station',
    subsystem: 'Base Station Subsystem (BSS)',
    accent: 'cyan',
    interfaces: ['Um (to MS)', 'Abis (to BSC)'],
    protocols: 'GMSK Modulation · LAPD · TRAU Frames',
    summary: 'Radio tower and transceiver hardware defining an individual cellular coverage cell.',
    roleAndFunction:
      'Houses RF antennas, power amplifiers, and transceivers (TRX). Handles physical layer air-interface radio transmission, signal strength measurement (RxLev), and timing advance.',
    communicationPath:
      'Bridges wireless MS handsets (Um interface) to the Base Station Controller via wired/microwave E1/IP backhaul (Abis interface).',
    keyIdentifiers: ['Cell Global Identity (CGI)', 'BSIC (Base Station Color Code)', 'ARFCN Carrier Frequencies'],
    diagramNodeIds: ['bts-1', 'bts-2'],
  },
  bsc: {
    id: 'bsc',
    acronym: 'BSC',
    name: 'Base Station Controller',
    subsystem: 'Base Station Subsystem (BSS)',
    accent: 'blue',
    interfaces: ['Abis (to BTS)', 'A (to MSC)'],
    protocols: 'BSSAP · SCCP · LAPD · Radio Resource Management (RR)',
    summary: 'Intelligent radio resource controller managing multiple BTS towers and handovers.',
    roleAndFunction:
      'Allocates and releases radio channels (SDCCH/TCH), manages intra-BSC handovers as users move, controls MS/BTS transmit power, and concentrates traffic toward the core MSC.',
    communicationPath:
      'Supervises multiple BTS sites over Abis links and connects to the Mobile Switching Center across the standardized A interface.',
    keyIdentifiers: ['LAC (Location Area Code)', 'PCU Control', 'Channel Allocation Table'],
    diagramNodeIds: ['bsc'],
  },
  msc: {
    id: 'msc',
    acronym: 'MSC',
    name: 'Mobile Switching Center',
    subsystem: 'Network & Switching Subsystem (NSS)',
    accent: 'blue',
    interfaces: ['A (BSS)', 'B (VLR)', 'C (HLR)', 'F (EIR)', 'SS7/ISUP (PSTN)'],
    protocols: 'SS7 · ISUP · MAP · SCCP · Call Control (CC)',
    summary: 'Core switching fabric coordinating call setup, routing, mobility, and billing.',
    roleAndFunction:
      'Acts like a central ISDN exchange tailored for cellular mobility. Authenticates subscribers, queries HLR/VLR for routing, switches voice circuits, and generates Call Detail Records (CDRs).',
    communicationPath:
      'Central hub linking the radio BSS (via A interface), subscriber databases (VLR, HLR, EIR), and external PSTN networks.',
    keyIdentifiers: ['MSC Point Code', 'MSRN (Roaming Number)', 'Call Detail Records (CDR)'],
    diagramNodeIds: ['msc'],
  },
  vlr: {
    id: 'vlr',
    acronym: 'VLR',
    name: 'Visitor Location Register',
    subsystem: 'Network & Switching Subsystem (NSS)',
    accent: 'purple',
    interfaces: ['B (to MSC)', 'D (to HLR)'],
    protocols: 'SS7 MAP (Mobile Application Part)',
    summary: 'Dynamic database tracking active and roaming subscribers inside an MSC service area.',
    roleAndFunction:
      'Stores temporary subscriber data copied from the HLR whenever a mobile enters its coverage zone. Assigns TMSI aliases for privacy and issues MSRN numbers for incoming call routing.',
    communicationPath:
      'Tightly paired with the MSC via the B interface and exchanges location updates with the HLR over the D interface.',
    keyIdentifiers: ['TMSI (Temporary Mobile Subscriber ID)', 'LAI (Location Area ID)', 'MSRN Pool'],
    diagramNodeIds: ['vlr'],
  },
  hlr: {
    id: 'hlr',
    acronym: 'HLR',
    name: 'Home Location Register',
    subsystem: 'Network & Switching Subsystem (NSS)',
    accent: 'purple',
    interfaces: ['C (to GMSC/MSC)', 'D (to VLR)', 'H (to AuC)'],
    protocols: 'SS7 MAP · Diameter/TCAP',
    summary: 'Master permanent database holding subscriber profiles, services, and current VLR location.',
    roleAndFunction:
      'Maintains permanent subscriber records including MSISDN-to-IMSI mapping, subscribed services (voice, SMS, roaming), call barring rules, and the address of the subscriber’s current VLR.',
    communicationPath:
      'Responds to MSC routing inquiries (C interface), tracks VLR updates (D interface), and fetches security triplets from AuC (H interface).',
    keyIdentifiers: ['IMSI Master Record', 'MSISDN Directory', 'Serving VLR Address'],
    diagramNodeIds: ['hlr'],
  },
  auc: {
    id: 'auc',
    acronym: 'AuC',
    name: 'Authentication Center',
    subsystem: 'Network & Switching Subsystem (NSS)',
    accent: 'purple',
    interfaces: ['H (to HLR)'],
    protocols: 'A3 Authentication · A8 Key Gen · A5 Cipher Triplets',
    summary: 'Cryptographic security engine validating SIM identity and protecting air-interface voice.',
    roleAndFunction:
      'Stores each subscriber’s secret Ki key securely and generates security triplets (RAND random challenge, SRES signed response, Kc encryption key) so calls cannot be spoofed or eavesdropped.',
    communicationPath:
      'Connects directly to the HLR over the secure H interface to supply authentication triplets to the MSC/VLR.',
    keyIdentifiers: ['Ki Secret Key', 'RAND Challenge (128-bit)', 'SRES (32-bit)', 'Kc Session Key (64-bit)'],
    diagramNodeIds: ['auc'],
  },
  eir: {
    id: 'eir',
    acronym: 'EIR',
    name: 'Equipment Identity Register',
    subsystem: 'Network & Switching Subsystem (NSS)',
    accent: 'purple',
    interfaces: ['F (to MSC)'],
    protocols: 'SS7 MAP Check-IMEI',
    summary: 'Hardware registry verifying handset IMEI numbers against White, Grey, and Black lists.',
    roleAndFunction:
      'Checks device hardware identity independently of the SIM card. Allows valid devices (White list), monitors faulty devices (Grey list), and blocks stolen or unapproved phones (Black list).',
    communicationPath:
      'Queried by the MSC over the F interface during call setup or attach procedures via MAP Check-IMEI.',
    keyIdentifiers: ['IMEI (15-digit Hardware ID)', 'White List', 'Grey List', 'Black List'],
    diagramNodeIds: ['eir'],
  },
  pstn: {
    id: 'pstn',
    acronym: 'PSTN',
    name: 'Public Switched Telephone Network',
    subsystem: 'External Network',
    accent: 'blue',
    interfaces: ['ISUP / SS7 Trunk (to GMSC/MSC)'],
    protocols: 'ISUP · E1/T1 PCM 64 kbps · SS7 Signaling',
    summary: 'Global circuit-switched fixed-line and inter-carrier voice backbone.',
    roleAndFunction:
      'Routes calls between mobile networks and landlines or external telecom carriers. The Gateway MSC translates cellular signaling into standard ISUP IAM/ACM/ANM trunks.',
    communicationPath:
      'Interconnects with the MSC/GMSC via high-capacity SS7/ISUP digital voice trunks.',
    keyIdentifiers: ['E.164 Country/Area Routing', 'ISUP CIC (Circuit ID Code)', 'G.711 PCM Trunk'],
    diagramNodeIds: ['pstn'],
  },
};

export const COMPONENT_ORDER: GsmComponentId[] = [
  'ms',
  'bts',
  'bsc',
  'msc',
  'hlr',
  'vlr',
  'auc',
  'eir',
  'pstn',
];

export const DIAGRAM_NODES: DiagramNodeConfig[] = [
  {
    id: 'ms-a',
    componentId: 'ms',
    label: 'MS (Caller)',
    sublabel: '+1-555-0142',
    x: 42,
    y: 256,
    width: 126,
    height: 76,
    accent: 'cyan',
  },
  {
    id: 'bts-1',
    componentId: 'bts',
    label: 'BTS (Origin)',
    sublabel: 'Cell A · 900 MHz',
    x: 214,
    y: 256,
    width: 126,
    height: 76,
    accent: 'cyan',
  },
  {
    id: 'bsc',
    componentId: 'bsc',
    label: 'BSC',
    sublabel: 'Radio Controller',
    x: 386,
    y: 256,
    width: 124,
    height: 76,
    accent: 'blue',
  },
  {
    id: 'msc',
    componentId: 'msc',
    label: 'MSC / GMSC',
    sublabel: 'Core Switch',
    x: 564,
    y: 252,
    width: 142,
    height: 84,
    accent: 'blue',
  },
  {
    id: 'vlr',
    componentId: 'vlr',
    label: 'VLR',
    sublabel: 'Visitor DB',
    x: 462,
    y: 78,
    width: 118,
    height: 70,
    accent: 'purple',
  },
  {
    id: 'hlr',
    componentId: 'hlr',
    label: 'HLR',
    sublabel: 'Home DB',
    x: 616,
    y: 78,
    width: 118,
    height: 70,
    accent: 'purple',
  },
  {
    id: 'auc',
    componentId: 'auc',
    label: 'AuC',
    sublabel: 'Auth Center',
    x: 774,
    y: 78,
    width: 118,
    height: 70,
    accent: 'purple',
  },
  {
    id: 'eir',
    componentId: 'eir',
    label: 'EIR',
    sublabel: 'IMEI Registry',
    x: 472,
    y: 446,
    width: 122,
    height: 70,
    accent: 'purple',
  },
  {
    id: 'pstn',
    componentId: 'pstn',
    label: 'PSTN',
    sublabel: 'Carrier Trunk',
    x: 676,
    y: 446,
    width: 132,
    height: 70,
    accent: 'blue',
  },
  {
    id: 'bts-2',
    componentId: 'bts',
    label: 'BTS (Receiver)',
    sublabel: 'Cell B · 1800 MHz',
    x: 778,
    y: 256,
    width: 130,
    height: 76,
    accent: 'cyan',
  },
  {
    id: 'ms-b',
    componentId: 'ms',
    label: 'MS (Receiver)',
    sublabel: '+1-555-0198',
    x: 952,
    y: 256,
    width: 126,
    height: 76,
    accent: 'cyan',
  },
];

export const DIAGRAM_LINKS: DiagramLinkConfig[] = [
  {
    id: 'ms-a_bts-1',
    from: 'ms-a',
    to: 'bts-1',
    interfaceName: 'Um',
    pathD: 'M 168 294 L 214 294',
    labelX: 191,
    labelY: 280,
  },
  {
    id: 'bts-1_bsc',
    from: 'bts-1',
    to: 'bsc',
    interfaceName: 'Abis',
    pathD: 'M 340 294 L 386 294',
    labelX: 363,
    labelY: 280,
  },
  {
    id: 'bsc_msc',
    from: 'bsc',
    to: 'msc',
    interfaceName: 'A',
    pathD: 'M 510 294 L 564 294',
    labelX: 537,
    labelY: 280,
  },
  {
    id: 'msc_vlr',
    from: 'msc',
    to: 'vlr',
    interfaceName: 'B',
    pathD: 'M 602 252 L 521 148',
    labelX: 545,
    labelY: 202,
  },
  {
    id: 'msc_hlr',
    from: 'msc',
    to: 'hlr',
    interfaceName: 'C',
    pathD: 'M 648 252 L 675 148',
    labelX: 678,
    labelY: 202,
  },
  {
    id: 'vlr_hlr',
    from: 'vlr',
    to: 'hlr',
    interfaceName: 'D',
    pathD: 'M 580 113 L 616 113',
    labelX: 598,
    labelY: 99,
  },
  {
    id: 'hlr_auc',
    from: 'hlr',
    to: 'auc',
    interfaceName: 'H',
    pathD: 'M 734 113 L 774 113',
    labelX: 754,
    labelY: 99,
  },
  {
    id: 'msc_eir',
    from: 'msc',
    to: 'eir',
    interfaceName: 'F',
    pathD: 'M 604 336 L 542 446',
    labelX: 556,
    labelY: 392,
  },
  {
    id: 'msc_pstn',
    from: 'msc',
    to: 'pstn',
    interfaceName: 'SS7 / ISUP',
    pathD: 'M 664 336 L 732 446',
    labelX: 726,
    labelY: 392,
  },
  {
    id: 'msc_bts-2',
    from: 'msc',
    to: 'bts-2',
    interfaceName: 'A / Abis',
    pathD: 'M 706 294 L 778 294',
    labelX: 742,
    labelY: 280,
  },
  {
    id: 'bts-2_ms-b',
    from: 'bts-2',
    to: 'ms-b',
    interfaceName: 'Um',
    pathD: 'M 908 294 L 952 294',
    labelX: 930,
    labelY: 280,
  },
];

export const NORMAL_CALL_STEPS: CallFlowStep[] = [
  {
    stepNumber: 1,
    title: 'Caller initiates a call',
    statusLabel: 'Channel Request',
    statusCategory: 'setup',
    activeNodes: ['ms-a', 'bts-1'],
    activeLinks: [{ linkId: 'ms-a_bts-1', direction: 'forward' }],
    signalStrengthDbm: -68,
    activeConnectionsCount: 1,
    protocolLayer: 'Um · RACH',
    protocolMessage: 'RACH -> Channel Request (Establish Voice Call to +1-555-0198)',
    explanation:
      'The caller dials the destination number on MS-A. The Mobile Station transmits a Channel Request burst over the Random Access Channel (RACH) across the Um air interface to request a dedicated signaling slot.',
    keyPoints: [
      'Uses slotted ALOHA on RACH to avoid collisions with other handsets.',
      'Carries establishment cause ("Originating Call") and a random reference tag.',
    ],
  },
  {
    stepNumber: 2,
    title: 'BTS receives the signal',
    statusLabel: 'Radio Demodulation',
    statusCategory: 'setup',
    activeNodes: ['ms-a', 'bts-1', 'bsc'],
    activeLinks: [
      { linkId: 'ms-a_bts-1', direction: 'forward' },
      { linkId: 'bts-1_bsc', direction: 'forward' },
    ],
    signalStrengthDbm: -66,
    activeConnectionsCount: 2,
    protocolLayer: 'Abis · LAPD',
    protocolMessage: 'CHAN_RQD -> BTS-1 measures RxLev (-66 dBm) & forwards to BSC',
    explanation:
      'BTS-1 receives the RF burst, calculates Timing Advance to synchronize TDMA frames, measures signal quality, and relays the Channel Required indication over the Abis link to the BSC.',
    keyPoints: [
      'GMSK demodulation extracts the burst at 270.833 kbps.',
      'Timing Advance compensates for propagation delay based on distance from tower.',
    ],
  },
  {
    stepNumber: 3,
    title: 'BSC manages radio resources',
    statusLabel: 'Channel Allocation',
    statusCategory: 'setup',
    activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc'],
    activeLinks: [
      { linkId: 'bts-1_bsc', direction: 'bidirectional' },
      { linkId: 'ms-a_bts-1', direction: 'reverse' },
      { linkId: 'bsc_msc', direction: 'forward' },
    ],
    signalStrengthDbm: -65,
    activeConnectionsCount: 3,
    protocolLayer: 'A · BSSAP / AGCH',
    protocolMessage: 'IMMEDIATE ASSIGN (SDCCH) -> CM Service Request forwarded to MSC',
    explanation:
      'The BSC reserves an available Standalone Dedicated Control Channel (SDCCH), instructs MS-A via BTS-1 to tune to it, and passes the CM Service Request over the A interface to the MSC.',
    keyPoints: [
      'Allocates SDCCH for signaling before committing a full voice Traffic Channel.',
      'Establishes an SCCP logical connection between BSC and MSC.',
    ],
  },
  {
    stepNumber: 4,
    title: 'MSC processes the call request',
    statusLabel: 'Call Processing',
    statusCategory: 'routing',
    activeNodes: ['bsc', 'msc', 'eir'],
    activeLinks: [
      { linkId: 'bsc_msc', direction: 'forward' },
      { linkId: 'msc_eir', direction: 'bidirectional' },
    ],
    signalStrengthDbm: -65,
    activeConnectionsCount: 2,
    protocolLayer: 'CC / MAP F',
    protocolMessage: 'CM Service Request -> MSC validates setup & queries EIR (Check-IMEI)',
    explanation:
      'The MSC inspects the dialed digits and caller identity, validates the handset hardware serial (IMEI) against the Equipment Identity Register (EIR) White List, and prepares subscriber authentication.',
    keyPoints: [
      'EIR confirms the handset is not stolen (Black List) or malfunctioning.',
      'MSC initiates security challenge before allowing call routing.',
    ],
  },
  {
    stepNumber: 5,
    title: 'Subscriber authentication takes place',
    statusLabel: 'Authenticating',
    statusCategory: 'security',
    activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc', 'hlr', 'auc'],
    activeLinks: [
      { linkId: 'msc_hlr', direction: 'bidirectional' },
      { linkId: 'hlr_auc', direction: 'bidirectional' },
      { linkId: 'bsc_msc', direction: 'bidirectional' },
      { linkId: 'bts-1_bsc', direction: 'bidirectional' },
      { linkId: 'ms-a_bts-1', direction: 'bidirectional' },
    ],
    signalStrengthDbm: -64,
    activeConnectionsCount: 5,
    protocolLayer: 'A3/A8 · MAP H',
    protocolMessage: 'Auth Triplet (RAND, SRES, Kc) -> MS-A SIM verified · A5 Ciphering ON',
    explanation:
      'The MSC requests cryptographic triplets from AuC via HLR. It sends a 128-bit RAND challenge to MS-A; the SIM computes SRES using secret key Ki (A3 algorithm). Matching SRES confirms authenticity and enables A5 encryption.',
    keyPoints: [
      'Secret key Ki never leaves the SIM card or AuC vault.',
      'Session key Kc (A8 algorithm) encrypts all subsequent voice and signaling.',
    ],
  },
  {
    stepNumber: 6,
    title: 'HLR and VLR verify subscriber information',
    statusLabel: 'Subscriber Verified',
    statusCategory: 'routing',
    activeNodes: ['msc', 'vlr', 'hlr'],
    activeLinks: [
      { linkId: 'msc_vlr', direction: 'bidirectional' },
      { linkId: 'msc_hlr', direction: 'bidirectional' },
      { linkId: 'vlr_hlr', direction: 'bidirectional' },
    ],
    signalStrengthDbm: -64,
    activeConnectionsCount: 3,
    protocolLayer: 'MAP B / C / D',
    protocolMessage: 'MAP SendRoutingInfo -> VLR & HLR confirm active caller & target profile',
    explanation:
      'The VLR confirms MS-A has active outgoing call privileges and no barring flags. Simultaneously, the MSC queries the HLR (MAP SendRoutingInfo) with the receiver’s MSISDN to look up subscriber status.',
    keyPoints: [
      'HLR resolves the dialed MSISDN phone number to the receiver’s internal IMSI.',
      'VLR updates the caller’s state from Idle to Call Originating.',
    ],
  },
  {
    stepNumber: 7,
    title: 'Receiver location is identified',
    statusLabel: 'Location Resolved',
    statusCategory: 'routing',
    activeNodes: ['msc', 'hlr', 'vlr', 'pstn'],
    activeLinks: [
      { linkId: 'msc_hlr', direction: 'reverse' },
      { linkId: 'vlr_hlr', direction: 'bidirectional' },
      { linkId: 'msc_pstn', direction: 'bidirectional' },
    ],
    signalStrengthDbm: -64,
    activeConnectionsCount: 3,
    protocolLayer: 'MAP / ISUP',
    protocolMessage: 'ProvideRoamingNumber -> MSRN & Cell B LAI returned · PSTN/Trunk checked',
    explanation:
      'The HLR contacts the receiver’s serving VLR to allocate a temporary Mobile Station Roaming Number (MSRN). With the receiver’s Location Area Identity (LAI) resolved, the MSC selects the optimal switching route (coordinating PSTN/carrier signaling if inter-network).',
    keyPoints: [
      'MSRN temporarily maps the call to the exact MSC/cell serving MS-B.',
      'Gateway routing checks PSTN/SS7 carrier interconnect tables.',
    ],
  },
  {
    stepNumber: 8,
    title: 'Network connects to receiver BTS',
    statusLabel: 'Paging Receiver',
    statusCategory: 'routing',
    activeNodes: ['msc', 'bts-2', 'ms-b'],
    activeLinks: [
      { linkId: 'msc_bts-2', direction: 'forward' },
      { linkId: 'bts-2_ms-b', direction: 'forward' },
    ],
    signalStrengthDbm: -65,
    activeConnectionsCount: 2,
    protocolLayer: 'A · PCH Paging',
    protocolMessage: 'PAGING REQUEST (TMSI) -> BTS-2 broadcasts on Paging Channel to MS-B',
    explanation:
      'The MSC sends a Paging Command toward the target cell’s BTS-2. BTS-2 broadcasts the receiver’s TMSI over the Paging Channel (PCH) so MS-B wakes up and responds.',
    keyPoints: [
      'Using TMSI instead of IMSI protects receiver privacy over the air.',
      'MS-B replies with a Paging Response and gets assigned a dedicated radio channel.',
    ],
  },
  {
    stepNumber: 9,
    title: 'Receiver mobile phone rings',
    statusLabel: 'Ringing',
    statusCategory: 'ringing',
    activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc', 'bts-2', 'ms-b'],
    activeLinks: [
      { linkId: 'bts-2_ms-b', direction: 'reverse' },
      { linkId: 'msc_bts-2', direction: 'reverse' },
      { linkId: 'bsc_msc', direction: 'reverse' },
      { linkId: 'bts-1_bsc', direction: 'reverse' },
      { linkId: 'ms-a_bts-1', direction: 'reverse' },
    ],
    signalStrengthDbm: -63,
    activeConnectionsCount: 5,
    protocolLayer: 'CC · ALERTING',
    protocolMessage: 'SETUP -> ALERTING (MS-B ringing · Ringback tone sent to MS-A)',
    explanation:
      'After verifying incoming call compatibility, MS-B begins ringing and sends an ALERTING message back through BTS-2 to the MSC. The MSC generates an audible ringback tone for Caller MS-A.',
    keyPoints: [
      'Traffic Channels (TCH) are pre-assigned on both ends ready for instant speech.',
      'Caller hears the carrier ringback tone confirming the target phone is ringing.',
    ],
  },
  {
    stepNumber: 10,
    title: 'Receiver accepts the call',
    statusLabel: 'Call Accepted',
    statusCategory: 'setup',
    activeNodes: ['ms-b', 'bts-2', 'msc', 'bsc', 'bts-1', 'ms-a'],
    activeLinks: [
      { linkId: 'bts-2_ms-b', direction: 'reverse' },
      { linkId: 'msc_bts-2', direction: 'reverse' },
      { linkId: 'bsc_msc', direction: 'reverse' },
      { linkId: 'bts-1_bsc', direction: 'reverse' },
      { linkId: 'ms-a_bts-1', direction: 'reverse' },
    ],
    signalStrengthDbm: -62,
    activeConnectionsCount: 5,
    protocolLayer: 'CC · CONNECT',
    protocolMessage: 'CONNECT -> CONNECT_ACK (MSC completes through-connection matrix)',
    explanation:
      'The receiver presses Answer on MS-B. MS-B transmits a CONNECT message to the MSC, which immediately sends CONNECT_ACK back, stops the ringback tone, and activates billing timers.',
    keyPoints: [
      'MSC switches the internal PCM voice matrix to bridge originating and terminating legs.',
      'CDR billing start timestamp is recorded at CONNECT_ACK.',
    ],
  },
  {
    stepNumber: 11,
    title: 'Voice connection is established',
    statusLabel: 'Voice Connected',
    statusCategory: 'connected',
    activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc', 'bts-2', 'ms-b', 'pstn'],
    activeLinks: [
      { linkId: 'ms-a_bts-1', direction: 'bidirectional' },
      { linkId: 'bts-1_bsc', direction: 'bidirectional' },
      { linkId: 'bsc_msc', direction: 'bidirectional' },
      { linkId: 'msc_bts-2', direction: 'bidirectional' },
      { linkId: 'bts-2_ms-b', direction: 'bidirectional' },
      { linkId: 'msc_pstn', direction: 'bidirectional' },
    ],
    signalStrengthDbm: -61,
    activeConnectionsCount: 6,
    protocolLayer: 'TCH · Full-Duplex Voice',
    protocolMessage: 'ACTIVE TCH (13 kbps RPE-LTP Speech · A5/1 Encrypted · Full Duplex)',
    explanation:
      'Full-duplex voice packets flow seamlessly in both directions across MS-A, BTS-1, BSC, MSC, BTS-2, and MS-B (with PSTN/trunk ready for carrier bridging). Radio quality and handovers are continuously monitored.',
    keyPoints: [
      'Speech is compressed via GSM Full-Rate/AMR codec and encrypted over Um.',
      'SACCH carries continuous signal measurements every 480 ms.',
    ],
  },
  {
    stepNumber: 12,
    title: 'Call is terminated & resources released',
    statusLabel: 'Call Terminated',
    statusCategory: 'terminating',
    activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc', 'vlr', 'bts-2', 'ms-b'],
    activeLinks: [
      { linkId: 'ms-a_bts-1', direction: 'forward' },
      { linkId: 'bts-1_bsc', direction: 'forward' },
      { linkId: 'bsc_msc', direction: 'forward' },
      { linkId: 'msc_vlr', direction: 'forward' },
      { linkId: 'msc_bts-2', direction: 'forward' },
      { linkId: 'bts-2_ms-b', direction: 'forward' },
    ],
    signalStrengthDbm: -69,
    activeConnectionsCount: 0,
    protocolLayer: 'CC · DISCONNECT / RELEASE',
    protocolMessage: 'DISCONNECT -> RELEASE_COMPLETE · TCH & SCCP Channels Reclaimed',
    explanation:
      'A subscriber hangs up, triggering DISCONNECT and RELEASE messages. The MSC closes the billing CDR, updates VLR status to Idle, and instructs BSC/BTS nodes on both sides to free radio timeslots.',
    keyPoints: [
      'Radio Traffic Channels (TCH) return immediately to the cell pool.',
      'VLR resets subscriber session state to Idle for future calls.',
    ],
  },
];

export function getScenarioSteps(scenario: SimulationScenario): CallFlowStep[] {
  if (scenario === 'normal') {
    return NORMAL_CALL_STEPS;
  }

  if (scenario === 'auth_failure') {
    return [
      ...NORMAL_CALL_STEPS.slice(0, 4),
      {
        stepNumber: 5,
        title: 'Authentication failure detected',
        statusLabel: 'Auth Rejected',
        statusCategory: 'error',
        activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc', 'hlr', 'auc'],
        errorNodes: ['ms-a', 'auc', 'msc'],
        activeLinks: [
          { linkId: 'msc_hlr', direction: 'bidirectional' },
          { linkId: 'hlr_auc', direction: 'bidirectional' },
          { linkId: 'bsc_msc', direction: 'reverse', isError: true },
          { linkId: 'bts-1_bsc', direction: 'reverse', isError: true },
          { linkId: 'ms-a_bts-1', direction: 'reverse', isError: true },
        ],
        signalStrengthDbm: -71,
        activeConnectionsCount: 0,
        protocolLayer: 'MM · AUTHENTICATION REJECT',
        protocolMessage: 'Cause #21: SRES Mismatch (SIM response != AuC triplet) -> Access Denied',
        explanation:
          'The SRES signature returned by MS-A does not match the expected SRES generated by the AuC from secret key Ki (or SIM is cloned/invalid). The MSC immediately transmits AUTHENTICATION REJECT and tears down the signaling channel.',
        keyPoints: [
          'Prevents unauthorized network access and SIM cloning attacks.',
          'All allocated SDCCH radio resources are immediately released.',
        ],
        isTerminalFailure: true,
      },
    ];
  }

  if (scenario === 'busy_receiver') {
    return [
      ...NORMAL_CALL_STEPS.slice(0, 8),
      {
        stepNumber: 9,
        title: 'Receiver line is busy',
        statusLabel: 'User Busy',
        statusCategory: 'error',
        activeNodes: ['ms-a', 'bts-1', 'bsc', 'msc', 'vlr', 'bts-2', 'ms-b'],
        errorNodes: ['ms-b', 'msc'],
        activeLinks: [
          { linkId: 'bts-2_ms-b', direction: 'reverse', isError: true },
          { linkId: 'msc_bts-2', direction: 'reverse', isError: true },
          { linkId: 'bsc_msc', direction: 'reverse', isError: true },
          { linkId: 'bts-1_bsc', direction: 'reverse', isError: true },
          { linkId: 'ms-a_bts-1', direction: 'reverse', isError: true },
        ],
        signalStrengthDbm: -66,
        activeConnectionsCount: 1,
        protocolLayer: 'CC · RELEASE (Cause #17)',
        protocolMessage: 'Cause #17: USER BUSY -> Busy tone sent to MS-A & circuit cleared',
        explanation:
          'MS-B (or its serving VLR) reports that the receiver is already engaged in another active call with no Call Waiting available. The MSC returns Cause #17 (User Busy), plays a busy tone to MS-A, and releases channels.',
        keyPoints: [
          'Terminating leg never enters ALERTING or CONNECT states.',
          'Originating SDCCH/TCH reservation is gracefully reclaimed.',
        ],
        isTerminalFailure: true,
      },
    ];
  }

  // call_failure scenario: radio congestion / dropped RF link at Step 4 or Step 8
  return [
    ...NORMAL_CALL_STEPS.slice(0, 2),
    {
      stepNumber: 3,
      title: 'Radio channel congestion / call failure',
      statusLabel: 'Call Failed',
      statusCategory: 'error',
      activeNodes: ['ms-a', 'bts-1', 'bsc'],
      errorNodes: ['bts-1', 'bsc'],
      activeLinks: [
        { linkId: 'ms-a_bts-1', direction: 'reverse', isError: true },
        { linkId: 'bts-1_bsc', direction: 'reverse', isError: true },
      ],
      signalStrengthDbm: -112,
      activeConnectionsCount: 0,
      protocolLayer: 'RR · IMMEDIATE ASSIGN REJECT',
      protocolMessage: 'Cause #34: No Radio Channel Available / Severe RF Fade (-112 dBm)',
      explanation:
        'All traffic timeslots on BTS-1 are saturated or signal strength dropped below the -104 dBm threshold. The BSC responds with IMMEDIATE ASSIGN REJECT (Cause #34: Congestion), aborting the call setup.',
      keyPoints: [
        'Demonstrates finite TDMA timeslot capacity (8 slots per ARFCN carrier).',
        'MS-A displays "Network Busy / Call Failed" and returns to idle camping.',
      ],
      isTerminalFailure: true,
    },
  ];
}
