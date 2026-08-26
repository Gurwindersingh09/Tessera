export type CaseAnalysisStage = 
  | 'parsing'
  | 'resolving_entities'
  | 'building_graph'
  | 'detecting_anomalies'
  | 'complete';

export interface StageConfig {
  id: CaseAnalysisStage;
  code: string;
  label: string;
  subhead: string;
  description: string;
  minProgress: number;
  maxProgress: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'GRAPH' | 'ALERT';
  text: string;
}

export interface CaseAnalysisLoaderProps {
  stage: CaseAnalysisStage;
  progress: number; // 0 to 100
  caseTitle?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  investigator?: string;
  totalRecords?: number;
  totalEntities?: number;
  onComplete?: () => void;
  className?: string;
}
