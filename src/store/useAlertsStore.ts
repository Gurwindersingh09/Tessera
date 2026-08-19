import { create } from 'zustand';

export interface AlertItem {
  id: string;
  type: 'lead' | 'footprint' | 'anomaly' | 'status_change';
  title: string;
  caseId?: string;
  caseTitle?: string;
  preview: string;
  timestamp: string;
  dateGroup: 'Today' | 'Yesterday' | 'Earlier this week' | 'Older';
  isRead: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  correlationScore?: number;
  details?: {
    entityCount?: number;
    phoneNumbers?: string[];
    ipAddresses?: string[];
    bankAccounts?: string[];
    ruleTriggered?: string;
  };
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1091',
    type: 'anomaly',
    title: 'Rapid mule account fan-out detected',
    caseId: 'CASE-0038',
    caseTitle: 'Operation Shadow Ledger',
    preview: '14 split NEFT/IMPS transfers totaling ₹4.2M routed through ICICI / HDFC mule accounts within 18 minutes.',
    timestamp: '10:42 AM',
    dateGroup: 'Today',
    isRead: false,
    severity: 'critical',
    correlationScore: 96,
    details: {
      entityCount: 14,
      bankAccounts: ['HDFC-***8821', 'ICICI-***4092', 'SBI-***1120'],
      ruleTriggered: 'RULE_BURST_DISPERSAL_VELOCITY_GT_80',
    },
  },
  {
    id: 'ALT-1090',
    type: 'lead',
    title: 'Triangulation hit on primary syndicate burner',
    caseId: 'CASE-0041',
    caseTitle: 'Telecom Triangulation Delta',
    preview: 'IMEI 864209048821039 pinged Sector 62 Noida BTS tower with concurrent WhatsApp gateway session.',
    timestamp: '08:15 AM',
    dateGroup: 'Today',
    isRead: false,
    severity: 'high',
    correlationScore: 89,
    details: {
      entityCount: 3,
      phoneNumbers: ['+91 98102 99481', '+91 88201 44029'],
      ruleTriggered: 'RULE_BTS_CONCURRENT_SUBSCRIBER_MATCH',
    },
  },
  {
    id: 'ALT-1089',
    type: 'footprint',
    title: 'Telegram handle correlation matched darknet vendor',
    caseId: 'CASE-0035',
    caseTitle: 'Operation Crimson Wire',
    preview: 'Telegram @ghost_broker_09 associated with ProtonMail alias recovered in memory dump from Device D-88.',
    timestamp: '06:30 AM',
    dateGroup: 'Today',
    isRead: false,
    severity: 'medium',
    correlationScore: 84,
    details: {
      entityCount: 4,
      ipAddresses: ['185.220.101.5', '194.26.29.112'],
      ruleTriggered: 'RULE_DARKNET_ALIAS_CROSS_INDEX',
    },
  },
  {
    id: 'ALT-1088',
    type: 'status_change',
    title: 'Supervisor assigned Priority Critical to CASE-0038',
    caseId: 'CASE-0038',
    caseTitle: 'Operation Shadow Ledger',
    preview: 'Senior Analyst Petrov escalated dossier due to high inter-state financial syndication flags.',
    timestamp: 'Yesterday, 04:20 PM',
    dateGroup: 'Yesterday',
    isRead: true,
    severity: 'critical',
    correlationScore: 92,
    details: {
      ruleTriggered: 'AUDIT_SUPERVISOR_OVERRIDE',
    },
  },
  {
    id: 'ALT-1087',
    type: 'anomaly',
    title: 'SIM swap detected on tracked beneficiary MSISDN',
    caseId: 'CASE-0041',
    caseTitle: 'Telecom Triangulation Delta',
    preview: 'Airtel subscriber +91 98102 99481 underwent unverified e-SIM swap at Delhi West service center.',
    timestamp: 'Yesterday, 01:10 PM',
    dateGroup: 'Yesterday',
    isRead: false,
    severity: 'high',
    correlationScore: 88,
    details: {
      phoneNumbers: ['+91 98102 99481'],
      ruleTriggered: 'RULE_TELECOM_VELOCITY_SIM_SWAP',
    },
  },
  {
    id: 'ALT-1086',
    type: 'lead',
    title: 'Crypto mixing wallet output matched Binance hot-wallet',
    caseId: 'CASE-0029',
    caseTitle: 'Phish-Net Financial Laundering',
    preview: '4.82 BTC unmixed output clustered to KYC-verified recipient in Surat jurisdiction.',
    timestamp: 'Aug 17, 11:05 AM',
    dateGroup: 'Earlier this week',
    isRead: true,
    severity: 'medium',
    correlationScore: 78,
    details: {
      entityCount: 6,
      ruleTriggered: 'RULE_BLOCKCHAIN_HEURISTIC_CLUSTER',
    },
  },
  {
    id: 'ALT-1085',
    type: 'footprint',
    title: 'MAC address duplicate detected across 2 state border nodes',
    caseId: 'CASE-0035',
    caseTitle: 'Operation Crimson Wire',
    preview: 'Hardware signature 4C:D5:77:88:1A:02 concurrently leased IP on Haryana & Delhi wireless APs.',
    timestamp: 'Aug 16, 09:40 PM',
    dateGroup: 'Earlier this week',
    isRead: true,
    severity: 'low',
    correlationScore: 65,
    details: {
      ipAddresses: ['103.21.244.18', '103.21.244.89'],
      ruleTriggered: 'RULE_MAC_GEO_IMPOSSIBILITY',
    },
  },
];

interface AlertsState {
  alerts: AlertItem[];
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  dismissAlert: (id: string) => void;
}

export const useAlertsStore = create<AlertsState>((set) => {
  // Load initial from localStorage if available
  let stored: AlertItem[] = INITIAL_ALERTS;
  try {
    const raw = localStorage.getItem('phishield-alerts');
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch {
    stored = INITIAL_ALERTS;
  }

  const save = (alerts: AlertItem[]) => {
    try {
      localStorage.setItem('phishield-alerts', JSON.stringify(alerts));
    } catch {
      // ignore
    }
  };

  return {
    alerts: stored,
    markAsRead: (id: string) => {
      set((state) => {
        const next = state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
        save(next);
        return { alerts: next };
      });
    },
    markAsUnread: (id: string) => {
      set((state) => {
        const next = state.alerts.map((a) => (a.id === id ? { ...a, isRead: false } : a));
        save(next);
        return { alerts: next };
      });
    },
    markAllAsRead: () => {
      set((state) => {
        const next = state.alerts.map((a) => ({ ...a, isRead: true }));
        save(next);
        return { alerts: next };
      });
    },
    dismissAlert: (id: string) => {
      set((state) => {
        const next = state.alerts.filter((a) => a.id !== id);
        save(next);
        return { alerts: next };
      });
    },
  };
});
