import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTesseraStore } from '../store/useTesseraStore';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  PhoneCall, 
  Globe, 
  Building2, 
  Share2, 
  Plus, 
  CheckCircle2, 
  FileSpreadsheet, 
  X, 
  UploadCloud, 
  ShieldAlert, 
  FileText,
  PanelRightClose,
  PanelRightOpen,
  FolderOpen
} from 'lucide-react';
import { CaseAnalysisLoader, CaseAnalysisStage } from '../components/CaseAnalysisLoader';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface DataSourceItem {
  id: string;
  name: string;
  category: string;
  iconName: 'cdr' | 'ipdr' | 'bank' | 'social' | 'custom';
  acceptedTypes: string;
  file: File | null;
  fileName: string;
  fileSizeStr: string;
  status: 'idle' | 'parsing' | 'parsed' | 'error';
  progress: number;
  rowCount: number;
  entitiesExtracted: number;
}

const INITIAL_SOURCES: DataSourceItem[] = [
  {
    id: 'cdr',
    name: 'CDR (Call Detail Records)',
    category: 'Telecom Logs',
    iconName: 'cdr',
    acceptedTypes: '.csv,.xlsx,.xls,.txt',
    file: null,
    fileName: '',
    fileSizeStr: '',
    status: 'idle',
    progress: 0,
    rowCount: 0,
    entitiesExtracted: 0,
  },
  {
    id: 'ipdr',
    name: 'IPDR (IP Detail Records)',
    category: 'Network Sessions',
    iconName: 'ipdr',
    acceptedTypes: '.csv,.json,.log,.txt',
    file: null,
    fileName: '',
    fileSizeStr: '',
    status: 'idle',
    progress: 0,
    rowCount: 0,
    entitiesExtracted: 0,
  },
  {
    id: 'bank',
    name: 'Bank Statements',
    category: 'Financial Ledgers',
    iconName: 'bank',
    acceptedTypes: '.csv,.xlsx,.xls,.pdf',
    file: null,
    fileName: '',
    fileSizeStr: '',
    status: 'idle',
    progress: 0,
    rowCount: 0,
    entitiesExtracted: 0,
  },
  {
    id: 'social',
    name: 'Social Media / OSINT',
    category: 'Public Intelligence',
    iconName: 'social',
    acceptedTypes: '.json,.csv,.txt',
    file: null,
    fileName: '',
    fileSizeStr: '',
    status: 'idle',
    progress: 0,
    rowCount: 0,
    entitiesExtracted: 0,
  },
];

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { addCase, pushNavHistory } = useTesseraStore();
  const { displayName } = useAuth();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [investigator, setInvestigator] = useState(displayName || 'Guest');
  const [status, setStatus] = useState<'active' | 'flagged' | 'closed'>('active');
  const [dataSources, setDataSources] = useState<DataSourceItem[]>(INITIAL_SOURCES);
  const [customSourceName, setCustomSourceName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [manifestCollapsed, setManifestCollapsed] = useState(false);

  // 3D Analysis Ingestion State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<CaseAnalysisStage>('parsing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const analysisTimersRef = useRef<number[]>([]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    pushNavHistory({ id: 'new-case', label: 'New Case', path: '/new-case', depth: 1 });
    return () => {
      // Clear timers on component unmount
      analysisTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processUploadedFile = (sourceId: string, file: File) => {
    setDataSources(prev => prev.map(s => {
      if (s.id === sourceId) {
        return {
          ...s,
          file,
          fileName: file.name,
          fileSizeStr: formatFileSize(file.size),
          status: 'parsing',
          progress: 8,
        };
      }
      return s;
    }));

    let progress = 8;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        const rowCount = Math.floor(file.size / 68) + Math.floor(Math.random() * 40) + 12;
        const entitiesExtracted = Math.max(2, Math.floor(rowCount / 8) + Math.floor(Math.random() * 5));

        setDataSources(prev => prev.map(s => {
          if (s.id === sourceId) {
            return {
              ...s,
              status: 'parsed',
              progress: 100,
              rowCount,
              entitiesExtracted,
            };
          }
          return s;
        }));
      } else {
        setDataSources(prev => prev.map(s => {
          if (s.id === sourceId) {
            return { ...s, progress };
          }
          return s;
        }));
      }
    }, 120);
  };

  const handleFileInputChange = (sourceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(sourceId, file);
    }
  };

  const handleBatchFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const lower = file.name.toLowerCase();
      let matchedSourceId = 'cdr';
      if (lower.includes('cdr') || lower.includes('call') || lower.includes('phone') || lower.includes('telecom')) {
        matchedSourceId = 'cdr';
      } else if (lower.includes('ipdr') || lower.includes('ip') || lower.includes('session') || lower.includes('gateway') || lower.includes('log')) {
        matchedSourceId = 'ipdr';
      } else if (lower.includes('bank') || lower.includes('statement') || lower.includes('ledger') || lower.includes('txn') || lower.includes('upi')) {
        matchedSourceId = 'bank';
      } else if (lower.includes('social') || lower.includes('osint') || lower.includes('profile') || lower.includes('telegram')) {
        matchedSourceId = 'social';
      } else {
        const availableEmpty = dataSources.find(s => s.status === 'idle');
        matchedSourceId = availableEmpty ? availableEmpty.id : 'cdr';
      }

      processUploadedFile(matchedSourceId, file);
    });
  };

  const handleDrop = (sourceId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(sourceId, file);
    }
  };

  const handleRemoveSourceFile = (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDataSources(prev => prev.map(s => {
      if (s.id === sourceId) {
        return {
          ...s,
          file: null,
          fileName: '',
          fileSizeStr: '',
          status: 'idle',
          progress: 0,
          rowCount: 0,
          entitiesExtracted: 0,
        };
      }
      return s;
    }));
  };

  const handleAddCustomSource = () => {
    if (!customSourceName.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newSource: DataSourceItem = {
      id: newId,
      name: customSourceName.trim(),
      category: 'Custom Dataset',
      iconName: 'custom',
      acceptedTypes: '.csv,.json,.xlsx,.txt,.log,.pdf',
      file: null,
      fileName: '',
      fileSizeStr: '',
      status: 'idle',
      progress: 0,
      rowCount: 0,
      entitiesExtracted: 0,
    };
    setDataSources(prev => [...prev, newSource]);
    setCustomSourceName('');
    setIsAddingCustom(false);
  };

  const uploadedSources = dataSources.filter(s => s.status === 'parsed');
  const totalUploadedRows = uploadedSources.reduce((sum, s) => sum + s.rowCount, 0);
  const totalExtractedEntities = uploadedSources.reduce((sum, s) => sum + s.entitiesExtracted, 0);

  const isFormValid = title.trim().length > 0 && uploadedSources.length > 0;

  const runAnalysisPipeline = (targetCaseId: string) => {
    setIsAnalyzing(true);
    setAnalysisStage('parsing');
    setAnalysisProgress(0);

    // Clear any existing timers
    analysisTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    analysisTimersRef.current = [];

    const startTime = Date.now();
    const TOTAL_DURATION = 10500; // 10.5 seconds for complete deep analysis experience

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(1, elapsed / TOTAL_DURATION);

      // Smooth percentage 0 -> 100
      const currentPct = Math.min(100, Math.round(progressRatio * 100));
      setAnalysisProgress(currentPct);

      // Determine stage based on progress
      if (currentPct < 25) {
        setAnalysisStage('parsing');
      } else if (currentPct < 55) {
        setAnalysisStage('resolving_entities');
      } else if (currentPct < 82) {
        setAnalysisStage('building_graph');
      } else if (currentPct < 99) {
        setAnalysisStage('detecting_anomalies');
      } else {
        setAnalysisStage('complete');
      }

      if (progressRatio >= 1) {
        window.clearInterval(intervalId);
        // Hold on complete state for 1.8s for celebration & smooth exit
        const navTimer = window.setTimeout(() => {
          navigate(`/case/${targetCaseId}`);
        }, 1800);
        analysisTimersRef.current.push(navTimer);
      }
    }, 40); // 25 updates per second for silky smooth progress bar

    analysisTimersRef.current.push(intervalId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isAnalyzing) return;

    const created = addCase({
      title: title.trim(),
      priority,
      investigator,
      status,
      entityCount: Math.max(1, totalExtractedEntities),
      anomalyCount: priority === 'critical' ? 12 : (priority === 'high' ? 6 : 2),
    });

    runAnalysisPipeline(created.id);
  };

  const renderIcon = (type: DataSourceItem['iconName']) => {
    switch (type) {
      case 'cdr': return <PhoneCall className="w-5 h-5 text-[#C4622D]" />;
      case 'ipdr': return <Globe className="w-5 h-5 text-[#8C3D1A]" />;
      case 'bank': return <Building2 className="w-5 h-5 text-[#6B2E12]" />;
      case 'social': return <Share2 className="w-5 h-5 text-[#D4854A]" />;
      default: return <FileText className="w-5 h-5 text-[var(--color-text-secondary)]" />;
    }
  };

  return (
    <div 
      className="grain-texture" 
      style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)', height: '100vh', overflowY: 'auto', position: 'relative' }}
    >
      {/* 3D Case Analysis Full-Screen Loader */}
      {isAnalyzing && (
        <CaseAnalysisLoader
          stage={analysisStage}
          progress={analysisProgress}
          caseTitle={title.trim() || 'Operation Investigation'}
          priority={priority}
          investigator={investigator}
          totalRecords={totalUploadedRows || 1840}
          totalEntities={totalExtractedEntities || 24}
        />
      )}
      {/* Header with quick collapse controls */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_SHARP }}
        style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', position: 'relative', zIndex: 1, background: 'var(--color-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Tessera / Case Intake</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
            Initialize New Investigation
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Manifest expand/collapse button */}
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setManifestCollapsed(!manifestCollapsed)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px' }}
            title={manifestCollapsed ? "Expand Case Manifest Panel" : "Compress Case Manifest Panel"}
          >
            {manifestCollapsed ? <PanelRightOpen className="w-3.5 h-3.5" /> : <PanelRightClose className="w-3.5 h-3.5" />}
            <span>{manifestCollapsed ? 'Show Manifest' : 'Hide Manifest'}</span>
          </button>

          <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: '6px 12px' }}>
            ← Cancel
          </button>
        </div>
      </motion.header>

      {/* Main Workspace: 2-Column Responsive Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        
        {/* Left Form Column (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: manifestCollapsed ? 960 : 760, transition: 'max-width 200ms ease' }}>
            
            {/* Section 1: Operational Metadata */}
            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4622D' }} />
                <span className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>1. Operational Metadata</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="data-label" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Case Title / Operation Codename *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operation Sentinel Dawn / Jamtara Ring Phase IV"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ padding: '9px 12px', fontSize: 13.5, borderRadius: 4, width: '100%', border: '1px solid var(--color-border)', background: 'var(--color-bg-raised)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="data-label">Target Priority</label>
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value as any)}
                      style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4, background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <option value="critical">Critical (Immediate Triage)</option>
                      <option value="high">High (Elevated Risk)</option>
                      <option value="medium">Medium (Standard Investigation)</option>
                      <option value="low">Low (Routine Monitoring)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="data-label">Initial Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as any)}
                      style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4, background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <option value="active">Active (Open Investigation)</option>
                      <option value="flagged">Flagged (High Risk Alert)</option>
                      <option value="closed">Closed / Cold</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="data-label">Lead Investigator</label>
                    <input
                      type="text"
                      value={investigator}
                      onChange={(e) => setInvestigator(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4, background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Real Local System File Uploads */}
            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4622D' }} />
                  <span className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>2. Ingest Forensic Data Sources *</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) {
                        setTitle('Operation Obsidian Falcon');
                      }
                      setDataSources(prev => prev.map((s, idx) => {
                        if (idx === 0) {
                          return {
                            ...s,
                            fileName: 'telecom_cdr_sector7_tower_dump.csv',
                            fileSizeStr: '4.8 MB',
                            status: 'parsed',
                            progress: 100,
                            rowCount: 4820,
                            entitiesExtracted: 38,
                          };
                        }
                        if (idx === 1) {
                          return {
                            ...s,
                            fileName: 'gateway_ipdr_session_routing.log',
                            fileSizeStr: '8.2 MB',
                            status: 'parsed',
                            progress: 100,
                            rowCount: 12400,
                            entitiesExtracted: 64,
                          };
                        }
                        if (idx === 2) {
                          return {
                            ...s,
                            fileName: 'swift_rtgs_mule_transactions.xlsx',
                            fileSizeStr: '2.1 MB',
                            status: 'parsed',
                            progress: 100,
                            rowCount: 1850,
                            entitiesExtracted: 29,
                          };
                        }
                        return s;
                      }));
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 10.5, color: '#E8B896', background: 'rgba(196, 98, 45, 0.15)',
                      border: '1px solid rgba(196, 98, 45, 0.4)', borderRadius: 4, padding: '3px 8px',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    }}
                    title="Populate realistic forensic data sources for instant demo testing"
                  >
                    <span>⚡ Load Demo Dossier</span>
                  </button>

                  {/* Batch multi-file input button */}
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 10.5, color: '#C4622D', background: 'var(--color-bg-raised)',
                      border: '1px solid var(--color-border)', borderRadius: 4, padding: '3px 8px',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    }}
                    title="Select multiple files from your computer at once"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#C4622D]" />
                    <span>Browse System Files</span>
                    <input
                      ref={batchFileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.xlsx,.xls,.json,.txt,.log,.pdf"
                      onChange={handleBatchFileInputChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                Select files from your own computer or drag & drop them into the categories below. Tessera automatically sanitizes schemas and extracts knowledge graph nodes.
              </p>

              {/* Grid of Dropzones */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {dataSources.map((source) => {
                  const isParsed = source.status === 'parsed';
                  const isParsing = source.status === 'parsing';

                  return (
                    <div
                      key={source.id}
                      onClick={() => {
                        if (!isParsed && fileInputRefs.current[source.id]) {
                          fileInputRefs.current[source.id]?.click();
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(source.id, e)}
                      style={{
                        border: isParsed ? '1.5px solid #C4622D' : '1.5px dashed var(--color-border)',
                        background: isParsed ? 'var(--color-bg-raised)' : 'var(--color-bg-surface)',
                        borderRadius: 6,
                        padding: '14px',
                        cursor: isParsed ? 'default' : 'pointer',
                        transition: 'all 150ms ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        position: 'relative',
                      }}
                      onMouseEnter={e => {
                        if (!isParsed) {
                          e.currentTarget.style.borderColor = '#C4622D';
                          e.currentTarget.style.background = 'var(--color-bg-hover)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isParsed) {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.background = 'var(--color-bg-surface)';
                        }
                      }}
                    >
                      {/* Hidden Native File Input for real computer file selection */}
                      <input
                        ref={el => { fileInputRefs.current[source.id] = el; }}
                        type="file"
                        accept={source.acceptedTypes}
                        onChange={(e) => handleFileInputChange(source.id, e)}
                        style={{ display: 'none' }}
                      />

                      {/* Top icon and label */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 6,
                            background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {renderIcon(source.iconName)}
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>
                              {source.name}
                            </div>
                            <div className="data-label" style={{ fontSize: '0.6rem' }}>
                              {source.category}
                            </div>
                          </div>
                        </div>

                        {isParsed && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSourceFile(source.id, e)}
                            title="Remove uploaded file"
                            style={{
                              border: 'none', background: 'transparent',
                              color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 2,
                            }}
                          >
                            <X className="w-4 h-4 hover:text-[var(--color-status-flagged)] transition-colors" />
                          </button>
                        )}
                      </div>

                      {/* Content / Upload State */}
                      {isParsed ? (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-primary)' }}>
                            <FileSpreadsheet className="w-3.5 h-3.5 text-[#C4622D]" />
                            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, fontSize: 10.5, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {source.fileName}
                            </span>
                            <span style={{ fontSize: 9.5, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                              {source.fileSizeStr}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 10.5, color: 'var(--color-status-closed)',
                            background: 'var(--color-status-active-bg)', padding: '3px 8px',
                            borderRadius: 4, border: '1px solid var(--color-status-active-border)',
                          }}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-status-closed)] flex-shrink-0" />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {source.rowCount.toLocaleString()} rows · {source.entitiesExtracted} entities extracted
                            </span>
                          </div>
                        </motion.div>
                      ) : isParsing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#C4622D', fontFamily: 'IBM Plex Mono, monospace' }}>
                            <span>Reading & parsing your file...</span>
                            <span>{source.progress}%</span>
                          </div>
                          {/* Animated Progress Bar */}
                          <div style={{ height: 4, width: '100%', background: 'var(--color-bg-base)', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${source.progress}%` }}
                              transition={{ duration: 0.3 }}
                              style={{ height: '100%', background: '#C4622D' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 11 }}>
                            <UploadCloud className="w-3.5 h-3.5 text-[#C4622D]" />
                            <span>Click to browse your system</span>
                          </div>
                          <span style={{ fontSize: 9.5, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-muted)' }}>
                            {source.acceptedTypes.replace(/\./g, '').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Source Option */}
              <div style={{ marginTop: 14 }}>
                {isAddingCustom ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--color-bg-raised)', padding: 10, borderRadius: 6, border: '1px solid var(--color-border)' }}>
                    <input
                      type="text"
                      placeholder="e.g. Surveillance Audio Transcripts / Vehicle GPS Logs"
                      value={customSourceName}
                      onChange={e => setCustomSourceName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 4, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-accent"
                      onClick={handleAddCustomSource}
                      style={{ padding: '6px 12px' }}
                    >
                      Add Source
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setIsAddingCustom(false)}
                      style={{ padding: '6px 12px' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 11, color: '#C4622D', background: 'transparent',
                      border: '1px dashed var(--color-border)', borderRadius: 4, padding: '7px 14px',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4622D'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add custom dataset type</span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 32 }}>
              <button
                type="submit"
                disabled={!isFormValid}
                className={isFormValid ? 'btn-accent' : ''}
                style={{
                  padding: '11px 32px',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  borderRadius: 4,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms ease',
                  background: isFormValid ? '#C4622D' : 'var(--color-bg-surface)',
                  color: isFormValid ? '#FFFFFF' : 'var(--color-text-muted)',
                  border: isFormValid ? '1px solid #C4622D' : '1px solid var(--color-border)',
                  opacity: isFormValid ? 1 : 0.6,
                }}
              >
                Create Case File
              </button>
              <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: '11px 22px' }}>
                Cancel
              </button>
              {!isFormValid && (
                <span style={{ fontSize: 11, color: '#C4622D', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {!title.trim() ? '• Enter a case title' : '• Upload at least 1 file from your system'}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right Collapsible Column: Case Summary Manifest Preview */}
        {!manifestCollapsed ? (
          <div style={{
            width: 320,
            borderLeft: '1px solid var(--color-border)',
            background: 'var(--color-bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '20px',
            gap: 16,
            transition: 'width 200ms ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Live Case Manifest</span>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  {title.trim() || 'Untitled Investigation'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManifestCollapsed(true)}
                title="Compress Manifest Panel"
                style={{
                  border: 'none', background: 'transparent',
                  color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 2,
                }}
              >
                <PanelRightClose className="w-4 h-4 hover:text-[#C4622D] transition-colors" />
              </button>
            </div>

            {/* Key Properties Box */}
            <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="data-label">Target Priority</span>
                <span style={{
                  fontSize: 10, textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 600, padding: '2px 7px', borderRadius: 3,
                  background: priority === 'critical' ? 'var(--color-status-flagged-bg)' : 'var(--color-status-warning-bg)',
                  color: priority === 'critical' ? 'var(--color-status-flagged)' : 'var(--color-status-warning)',
                  border: `1px solid ${priority === 'critical' ? 'var(--color-status-flagged-border)' : 'var(--color-status-warning-border)'}`,
                }}>
                  {priority}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="data-label">Status</span>
                <span style={{ fontSize: 10.5, color: 'var(--color-text-primary)', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                  {status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="data-label">Investigator</span>
                <span style={{ fontSize: 10.5, color: 'var(--color-text-primary)', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                  {investigator || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Ingestion Checklist */}
            <div style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span className="data-label" style={{ color: '#C4622D' }}>Data Source Ingestion</span>
                <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-secondary)' }}>
                  {uploadedSources.length} attached
                </span>
              </div>

              {dataSources.map(s => {
                const isAttached = s.status === 'parsed';
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 170 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: isAttached ? 'var(--color-status-closed)' : 'var(--color-border)', flexShrink: 0,
                      }} />
                      <span style={{ color: isAttached ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: isAttached ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.name.split(' ')[0]} {s.fileName ? `(${s.fileName})` : ''}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: isAttached ? '#C4622D' : 'var(--color-text-muted)' }}>
                      {isAttached ? `${s.rowCount} rows` : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Readiness Meter */}
            <div style={{
              background: isFormValid ? 'var(--color-status-active-bg)' : 'var(--color-bg-raised)',
              border: `1px solid ${isFormValid ? 'var(--color-status-active-border)' : 'var(--color-border)'}`,
              borderRadius: 6,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isFormValid ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-status-closed)]" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-[var(--color-status-warning)]" />
                )}
                <span style={{ fontSize: 11, fontWeight: 600, color: isFormValid ? 'var(--color-status-closed)' : '#C4622D' }}>
                  {isFormValid ? 'Ready for Ingestion' : 'Intake Checklist Incomplete'}
                </span>
              </div>
              <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.35 }}>
                {isFormValid
                  ? `Ready to generate knowledge graph with ${totalExtractedEntities} identified entities across ${totalUploadedRows.toLocaleString()} transaction rows.`
                  : 'Select at least one dataset from your computer to compile the dossier.'}
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setManifestCollapsed(false)}
            title="Expand Case Manifest Panel"
            style={{
              width: 32,
              borderLeft: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 16,
              cursor: 'pointer',
              gap: 12,
            }}
          >
            <PanelRightOpen className="w-4 h-4 text-[var(--color-text-secondary)] hover:text-[#C4622D]" />
            <span style={{
              writingMode: 'vertical-rl',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C4622D',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            }}>
              Manifest ({uploadedSources.length})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default NewCasePage;
