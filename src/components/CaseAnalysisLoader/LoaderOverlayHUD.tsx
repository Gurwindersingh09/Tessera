import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseAnalysisStage, StageConfig, TelemetryLog } from './types';
import { Cpu, Network, ShieldAlert, CheckCircle2, FileSearch, Sparkles, Binary } from 'lucide-react';

interface LoaderOverlayHUDProps {
  stage: CaseAnalysisStage;
  progress: number;
  caseTitle?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  investigator?: string;
  totalRecords?: number;
  totalEntities?: number;
}

const STAGE_CONFIGS: Record<CaseAnalysisStage, StageConfig> = {
  parsing: {
    id: 'parsing',
    code: 'STAGE 01/04',
    label: 'PARSING FORENSIC DOSSIER...',
    subhead: 'SCHEMA SANITIZATION & RECORD INGESTION',
    description: 'Ingesting multi-source telecom CDR, banking ledgers, and IPDR network session logs into high-throughput tensor buffers.',
    minProgress: 0,
    maxProgress: 25,
  },
  resolving_entities: {
    id: 'resolving_entities',
    code: 'STAGE 02/04',
    label: 'RESOLVING CROSS-DATASET ENTITIES...',
    subhead: 'FUZZY MATCHING & CORRELATION ENGINE',
    description: 'Disambiguating alias records, IMEI/IMSI cellular identifiers, bank accounts, and OSINT handles across disparate feeds.',
    minProgress: 25,
    maxProgress: 55,
  },
  building_graph: {
    id: 'building_graph',
    code: 'STAGE 03/04',
    label: 'SYNTHESIZING KNOWLEDGE GRAPH...',
    subhead: 'DIRECTED TOPOLOGY GENERATION',
    description: 'Computing adjacency matrices, temporal call vectors, and financial transaction flow edges across all resolved entity nodes.',
    minProgress: 55,
    maxProgress: 82,
  },
  detecting_anomalies: {
    id: 'detecting_anomalies',
    code: 'STAGE 04/04',
    label: 'DETECTING ANOMALIES & RISK CLUSTERS...',
    subhead: 'BEHAVIORAL ML & HEURISTIC SCORING',
    description: 'Running circular laundering pattern detectors, sudden velocity spikes, rapid SIM swap alerts, and coordinated ring clustering.',
    minProgress: 82,
    maxProgress: 98,
  },
  complete: {
    id: 'complete',
    code: 'FINALIZED',
    label: 'DOSSIER SYNTHESIS COMPLETE',
    subhead: 'WORKSPACE COMPILED & READY',
    description: 'Forensic graph synthesized. Initializing interactive investigation canvas and telemetry feeds.',
    minProgress: 98,
    maxProgress: 100,
  },
};

const STAGES_LIST: { id: CaseAnalysisStage; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'parsing', label: '01. Ingest & Parse', icon: FileSearch },
  { id: 'resolving_entities', label: '02. Resolve Entities', icon: Cpu },
  { id: 'building_graph', label: '03. Synthesize Graph', icon: Network },
  { id: 'detecting_anomalies', label: '04. Detect Anomalies', icon: ShieldAlert },
];

export const LoaderOverlayHUD: React.FC<LoaderOverlayHUDProps> = ({
  stage,
  progress,
  caseTitle = 'Operation Codename',
  priority = 'high',
  investigator = 'Investigator',
  totalRecords = 1840,
  totalEntities = 24,
}) => {
  const currentConfig = STAGE_CONFIGS[stage] || STAGE_CONFIGS.parsing;
  const isComplete = stage === 'complete' || progress >= 100;

  // Real-time simulated telemetry log stream matching stage & progress
  const activeLogs: TelemetryLog[] = useMemo(() => {
    const logs: TelemetryLog[] = [];
    const now = new Date();
    const formatTime = (offsetSec: number) => {
      const d = new Date(now.getTime() - offsetSec * 1000);
      return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0').slice(0, 2);
    };

    if (progress >= 5) {
      logs.push({
        id: '1',
        timestamp: formatTime(6),
        level: 'INFO',
        text: `Allocating neural tensor buffers for "${caseTitle.slice(0, 24)}"`,
      });
    }
    if (progress >= 15) {
      logs.push({
        id: '2',
        timestamp: formatTime(5),
        level: 'INFO',
        text: `Sanitizing schema: decoded ${Math.floor(totalRecords * (progress / 25)) || 1400} raw transaction rows`,
      });
    }
    if (progress >= 26) {
      logs.push({
        id: '3',
        timestamp: formatTime(4),
        level: 'SUCCESS',
        text: `Ingestion verified: ${totalRecords.toLocaleString()} rows mapped to ${totalEntities} seed nodes`,
      });
    }
    if (progress >= 38) {
      logs.push({
        id: '4',
        timestamp: formatTime(3),
        level: 'GRAPH',
        text: `Cross-referencing 28 cellular IMEI/IMSI signatures with bank account records`,
      });
    }
    if (progress >= 52) {
      logs.push({
        id: '5',
        timestamp: formatTime(2.5),
        level: 'GRAPH',
        text: `Resolving aliases: merged 9 proxy identifiers across disparate OSINT dumps`,
      });
    }
    if (progress >= 66) {
      logs.push({
        id: '6',
        timestamp: formatTime(2),
        level: 'GRAPH',
        text: `Constructed directed adjacency topology: 46 entity nodes · 112 transaction edges`,
      });
    }
    if (progress >= 78) {
      logs.push({
        id: '7',
        timestamp: formatTime(1.5),
        level: 'INFO',
        text: `Executing circular flow heuristics & behavioral velocity outlier models`,
      });
    }
    if (progress >= 88) {
      logs.push({
        id: '8',
        timestamp: formatTime(0.8),
        level: 'ALERT',
        text: `Flagged 5 high-risk structuring spikes & 2 layered mule laundering rings`,
      });
    }
    if (progress >= 98) {
      logs.push({
        id: '9',
        timestamp: formatTime(0.1),
        level: 'SUCCESS',
        text: `Intelligence dossier synthesized & indexed. Initializing analytical workspace...`,
      });
    }
    return logs.slice(-3); // Keep latest 3 logs for clean HUD
  }, [progress, caseTitle, totalRecords, totalEntities]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-10 select-none z-10 overflow-hidden font-mono">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#C4622D]/20 pb-4 backdrop-blur-[2px]">
        {/* Left Branding & Case Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#C4622D]/40 bg-[#C4622D]/10 flex items-center justify-center text-[#E58A4E] shadow-[0_0_15px_rgba(196,98,45,0.3)]">
            <Binary className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#E58A4E]">
                TESSERA // FORENSIC ENGINE
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E58A4E] animate-ping" />
            </div>
            <div className="text-xs text-[#E8B896] font-semibold tracking-wide truncate max-w-xs md:max-w-md">
              {caseTitle || 'INITIALIZING INVESTIGATION'}
            </div>
          </div>
        </div>

        {/* Right Metadata Badges */}
        <div className="flex items-center gap-3 text-[11px] text-[#A89F93]">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17181B]/80 border border-[#C4622D]/20">
            <span className="text-[#A89F93]/60 text-[9px] uppercase tracking-wider">Priority:</span>
            <span className="text-[#E58A4E] uppercase font-semibold">{priority}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17181B]/80 border border-[#C4622D]/20">
            <span className="text-[#A89F93]/60 text-[9px] uppercase tracking-wider">Investigator:</span>
            <span className="text-[#EDEEF0]">{investigator}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C4622D]/15 border border-[#C4622D]/40 text-[#E8B896]">
            <span className="w-2 h-2 rounded-full bg-[#E58A4E] inline-block animate-pulse" />
            <span className="text-[10px] tracking-wider uppercase font-semibold">SYNTHESIS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Center Stage & Progress HUD (Positioned below the 3D cube center) */}
      <div className="flex flex-col items-center justify-center my-auto px-4 text-center max-w-3xl mx-auto w-full">
        {/* Stage Code Badge */}
        <motion.div
          key={currentConfig.code}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4622D]/15 border border-[#C4622D]/40 text-[#E58A4E] text-[10px] tracking-[0.25em] font-semibold mb-3 shadow-[0_0_20px_rgba(196,98,45,0.25)]"
        >
          <Sparkles className="w-3 h-3 text-[#E58A4E]" />
          <span>{currentConfig.code}</span>
        </motion.div>

        {/* Main Stage Title in App's Terracotta Mono Font */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentConfig.label}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
            transition={{ duration: 0.35 }}
            className="text-lg md:text-2xl lg:text-3xl font-bold tracking-[0.18em] uppercase text-[#E58A4E] drop-shadow-[0_0_18px_rgba(229,138,78,0.5)] mb-2"
          >
            {currentConfig.label}
          </motion.h2>
        </AnimatePresence>

        {/* Subtitle / Subhead */}
        <motion.div
          key={currentConfig.subhead}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] md:text-xs text-[#E8B896]/80 tracking-[0.14em] uppercase font-semibold mb-3"
        >
          {currentConfig.subhead}
        </motion.div>

        {/* Descriptive Forensic Subroutine Narrative */}
        <p className="text-[11px] md:text-xs text-[#A89F93] max-w-lg leading-relaxed mb-6 hidden sm:block">
          {currentConfig.description}
        </p>

        {/* 4-Step Pipeline Step Trackers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-2xl mb-6">
          {STAGES_LIST.map((step, idx) => {
            const stepOrder = ['parsing', 'resolving_entities', 'building_graph', 'detecting_anomalies'];
            const currentIndex = stepOrder.indexOf(stage);
            const thisIndex = stepOrder.indexOf(step.id);
            const isStepActive = stage === step.id;
            const isStepDone = currentIndex > thisIndex || isComplete;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-2 rounded border text-left transition-all duration-300 ${
                  isStepActive
                    ? 'bg-[#C4622D]/20 border-[#E58A4E] shadow-[0_0_12px_rgba(229,138,78,0.3)] text-[#EDEEF0]'
                    : isStepDone
                    ? 'bg-[#1E2023]/60 border-[#4E9A5E]/40 text-[#A89F93]'
                    : 'bg-[#17181B]/40 border-[#2A2C30] text-[#71747A]'
                }`}
              >
                {isStepDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4E9A5E] shrink-0" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isStepActive ? 'text-[#E58A4E] animate-pulse' : 'text-[#71747A]'}`} />
                )}
                <span className="text-[10px] tracking-wider truncate font-semibold">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sleek Animated Progress Bar */}
        <div className="w-full max-w-2xl flex flex-col gap-2">
          <div className="relative h-2 w-full bg-[#17181B] rounded-full overflow-hidden border border-[#C4622D]/30 shadow-inner">
            {/* Glowing gradient progress fill */}
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#8C3D1A] via-[#C4622D] to-[#E58A4E] rounded-full"
              style={{
                width: `${Math.min(100, Math.max(2, progress))}%`,
                boxShadow: '0 0 16px rgba(229, 138, 78, 0.8), 0 0 4px #FFFFFF',
              }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
            {/* Animated high-tech scan line highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>

          {/* Progress Numerals & Throughput Counter */}
          <div className="flex items-center justify-between text-[11px] text-[#A89F93] px-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#E58A4E] font-bold text-xs tracking-wider">
                {String(Math.round(progress)).padStart(3, '0')}%
              </span>
              <span className="text-[#71747A]">// 100.0%</span>
            </div>

            <div className="text-[10px] text-[#E8B896]/70 tracking-wider">
              {isComplete ? (
                <span className="text-[#4E9A5E] font-semibold">READY // DISPATCHING WORKSPACE</span>
              ) : (
                <span>THROUGHPUT: ~{Math.floor(1400 + progress * 15)} RECORDS/S</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Telemetry Stream Ticker */}
      <div className="border-t border-[#C4622D]/20 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-[#71747A] backdrop-blur-[2px]">
        {/* Terminal Micro-Logs */}
        <div className="flex flex-col gap-1 w-full max-w-xl">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#A89F93]/60 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E58A4E]" />
            <span>Telemetry Event Stream</span>
          </div>

          <div className="flex flex-col gap-0.5 font-mono">
            {activeLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-2 text-[10px] truncate">
                <span className="text-[#71747A] text-[9px]">[{log.timestamp}]</span>
                <span
                  className={`font-semibold text-[9px] px-1 rounded ${
                    log.level === 'ALERT'
                      ? 'bg-[#B53924]/20 text-[#E05A47]'
                      : log.level === 'GRAPH'
                      ? 'bg-[#C4622D]/20 text-[#E58A4E]'
                      : log.level === 'SUCCESS'
                      ? 'bg-[#3D7A4A]/20 text-[#4E9A5E]'
                      : 'bg-[#1E2023] text-[#A89F93]'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-[#EDEEF0]/90 truncate">{log.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Session Signature */}
        <div className="hidden lg:flex flex-col items-end text-[9px] text-[#71747A] tracking-widest font-mono">
          <span>LATENCY: 1.2MS</span>
          <span>GPU RENDERER: WEBGL2 COMPLIANT</span>
          <span className="text-[#E8B896]/60">TESSERA PROTOCOL V4.2</span>
        </div>
      </div>
    </div>
  );
};

export default LoaderOverlayHUD;
