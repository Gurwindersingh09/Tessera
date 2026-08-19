export interface CaseItem {
  id: string;
  title: string;
  status: 'active' | 'flagged' | 'closed' | 'archived';
  entityCount: number;
  anomalyCount: number;
  lastUpdated: string;
  investigator: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface NavEntry {
  id: string;
  label: string;
  path: string;
  depth: number;
}

export interface AnalyticsEvent {
  entity_id: string;
  event_type: 'CDR_CALL' | 'CDR_SMS' | 'IPDR_SESSION' | 'BANK_TRANSFER' | 'SOCIAL_POST' | 'SOCIAL_MESSAGE';
  timestamp: string; // ISO 8601
  counterparty_id: string | null;
  location: { lat: number; lng: number } | null;
  amount: number | null;
  metadata: Record<string, unknown>;
}

export interface AnomalyFlag {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rule: string;
  description: string;
  entities: string[];
  timestamp: string;
}

export interface EntityNode {
  id: string;
  type: 'PHONE' | 'IMEI' | 'BANK_ACCOUNT' | 'SOCIAL_HANDLE' | 'PERSON';
  label: string;
  flags: AnomalyFlag[];
  events: AnalyticsEvent[];
}

export interface RelationshipEdge {
  source: string;
  target: string;
  type: 'CALLED' | 'TRANSACTED_WITH' | 'MESSAGED' | 'SHARED_LOCATION' | 'SHARED_DEVICE';
  weight: number;
  events: AnalyticsEvent[];
}
