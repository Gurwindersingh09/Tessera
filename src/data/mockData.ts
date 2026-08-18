import { EntityNode, RelationshipEdge, AnalyticsEvent, AnomalyFlag } from '../types/schema';

export const mockEntities: EntityNode[] = [
  { id: '919876543210', type: 'PHONE', label: '+91 98765 43210', flags: [], events: [] },
  { id: '918765432109', type: 'PHONE', label: '+91 87654 32109', flags: [], events: [] },
  { id: '354123067890123', type: 'IMEI', label: 'IMEI: 354123...', flags: [], events: [] },
  { id: 'HDFC0001234', type: 'BANK_ACCOUNT', label: 'HDFC *1234', flags: [], events: [] },
  { id: 'ICICI0009876', type: 'BANK_ACCOUNT', label: 'ICICI *9876', flags: [], events: [] },
  { id: '@cryptoking99', type: 'SOCIAL_HANDLE', label: '@cryptoking99', flags: [], events: [] },
  { id: 'P_VISHAL_K', type: 'PERSON', label: 'Vishal Kumar', flags: [], events: [] },
];

export const mockEdges: RelationshipEdge[] = [
  { source: '919876543210', target: '918765432109', type: 'CALLED', weight: 15, events: [] },
  { source: '919876543210', target: '354123067890123', type: 'SHARED_DEVICE', weight: 1, events: [] },
  { source: 'HDFC0001234', target: 'ICICI0009876', type: 'TRANSACTED_WITH', weight: 5, events: [] },
  { source: 'P_VISHAL_K', target: '919876543210', type: 'SHARED_DEVICE', weight: 1, events: [] },
  { source: 'P_VISHAL_K', target: 'HDFC0001234', type: 'SHARED_DEVICE', weight: 1, events: [] },
  { source: '918765432109', target: '@cryptoking99', type: 'SHARED_DEVICE', weight: 1, events: [] },
];

export const mockEvents: AnalyticsEvent[] = [
  {
    entity_id: '919876543210',
    event_type: 'CDR_CALL',
    timestamp: '2026-08-17T14:30:00Z',
    counterparty_id: '918765432109',
    location: { lat: 28.5355, lng: 77.3910 }, // Noida
    amount: null,
    metadata: { duration: 145, cell_tower: 'NOI_SEC_18_A' }
  },
  {
    entity_id: '919876543210',
    event_type: 'CDR_CALL',
    timestamp: '2026-08-17T15:45:00Z',
    counterparty_id: '918765432109',
    location: { lat: 28.6139, lng: 77.2090 }, // New Delhi
    amount: null,
    metadata: { duration: 320, cell_tower: 'DEL_CP_01' }
  },
  {
    entity_id: 'HDFC0001234',
    event_type: 'BANK_TRANSFER',
    timestamp: '2026-08-17T16:00:00Z',
    counterparty_id: 'ICICI0009876',
    location: null,
    amount: 500000,
    metadata: { mode: 'IMPS', ref: 'IMPS/622918/FNDTRF' }
  },
  {
    entity_id: '918765432109',
    event_type: 'IPDR_SESSION',
    timestamp: '2026-08-17T16:05:00Z',
    counterparty_id: null,
    location: { lat: 28.4595, lng: 77.0266 }, // Gurgaon
    amount: null,
    metadata: { ip: '45.112.145.22', bytes_up: 1048576, dest_port: 443 }
  }
];

export const mockAnomalies: AnomalyFlag[] = [
  {
    id: 'FLAG-001',
    severity: 'CRITICAL',
    rule: 'IMMEDIATE_CASH_OUT',
    description: 'Large transfer followed by immediate ATM withdrawal across linked nodes.',
    entities: ['HDFC0001234', 'ICICI0009876'],
    timestamp: '2026-08-17T16:02:00Z'
  },
  {
    id: 'FLAG-002',
    severity: 'HIGH',
    rule: 'BURNER_PHONE_PATTERN',
    description: 'High volume of outgoing calls to unique numbers with zero incoming calls.',
    entities: ['919876543210'],
    timestamp: '2026-08-17T15:00:00Z'
  },
  {
    id: 'FLAG-003',
    severity: 'MEDIUM',
    rule: 'GEO_VELOCITY_MISMATCH',
    description: 'Impossible travel time between sequential CDR locations.',
    entities: ['919876543210'],
    timestamp: '2026-08-17T15:45:00Z'
  }
];

// Link events and flags to entities for easy access
mockEntities.forEach(entity => {
  entity.events = mockEvents.filter(e => e.entity_id === entity.id || e.counterparty_id === entity.id);
  entity.flags = mockAnomalies.filter(a => a.entities.includes(entity.id));
});
