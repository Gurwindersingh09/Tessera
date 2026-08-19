import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Fingerprint, 
  AlertTriangle, 
  RefreshCw, 
  CheckCheck, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Mail, 
  MailOpen, 
  ShieldAlert, 
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAlertsStore, AlertItem } from '../store/useAlertsStore';
import { useTesseraStore } from '../store/useTesseraStore';

type FilterCategory = 'all' | 'unread' | 'lead' | 'footprint' | 'critical';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, markAsRead, markAsUnread, markAllAsRead, dismissAlert } = useAlertsStore();
  const { pushNavHistory } = useTesseraStore();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'unread') return !alert.isRead;
    if (activeFilter === 'lead') return alert.type === 'lead';
    if (activeFilter === 'footprint') return alert.type === 'footprint';
    if (activeFilter === 'critical') return alert.severity === 'critical';
    return true;
  });

  // Group by dateGroup
  const dateGroups: AlertItem['dateGroup'][] = ['Today', 'Yesterday', 'Earlier this week', 'Older'];
  const groupedAlerts = dateGroups.map((group) => ({
    group,
    items: filteredAlerts.filter((a) => a.dateGroup === group),
  })).filter((g) => g.items.length > 0);

  const handleRowClick = (alert: AlertItem) => {
    if (!alert.isRead) {
      markAsRead(alert.id);
    }
    setExpandedId(expandedId === alert.id ? null : alert.id);
  };

  const handleOpenCase = (caseId: string, caseTitle?: string) => {
    pushNavHistory({
      id: `case-${caseId}`,
      label: `Case: ${caseTitle || caseId}`,
      path: `/case/${caseId}`,
      depth: 1,
    });
    navigate(`/case/${caseId}`);
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'lead':
        return <Search className="w-4 h-4 text-[#C4622D]" />;
      case 'footprint':
        return <Fingerprint className="w-4 h-4 text-[#D4854A]" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-[var(--color-status-flagged)]" />;
      case 'status_change':
        return <RefreshCw className="w-4 h-4 text-[var(--color-text-secondary)]" />;
    }
  };

  const getSeverityBadge = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'IBM Plex Mono, monospace',
            padding: '2px 7px',
            borderRadius: 3,
            background: 'var(--color-status-flagged-bg)',
            color: 'var(--color-status-flagged)',
            border: '1px solid var(--color-status-flagged-border)',
            fontWeight: 600,
          }}>
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'IBM Plex Mono, monospace',
            padding: '2px 7px',
            borderRadius: 3,
            background: 'var(--color-status-warning-bg)',
            color: 'var(--color-status-warning)',
            border: '1px solid var(--color-status-warning-border)',
            fontWeight: 600,
          }}>
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'IBM Plex Mono, monospace',
            padding: '2px 7px',
            borderRadius: 3,
            background: 'var(--color-status-active-bg)',
            color: 'var(--color-status-active)',
            border: '1px solid var(--color-status-active-border)',
            fontWeight: 500,
          }}>
            MED
          </span>
        );
      case 'low':
        return (
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'IBM Plex Mono, monospace',
            padding: '2px 7px',
            borderRadius: 3,
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}>
            LOW
          </span>
        );
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden font-sans"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
      onClick={() => setActiveKebabId(null)}
    >
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <header 
        className="px-6 md:px-8 py-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="data-label">TESSERA</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>/</span>
            <span className="data-label" style={{ color: '#C4622D' }}>INTELLIGENCE ALERTS</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 
              style={{
                fontSize: '1.65rem',
                fontWeight: 600,
                fontFamily: '"Fraunces", Georgia, serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: 'var(--color-text-primary)',
              }}
            >
              Alerts & Triggers
            </h1>
            {unreadCount > 0 && (
              <span 
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: 'var(--color-status-active-bg)',
                  color: 'var(--color-status-active)',
                  border: '1px solid var(--color-status-active-border)',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="btn-ghost flex items-center gap-1.5"
              style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── Filter Pills Bar ────────────────────────────────────────── */}
      <div 
        className="px-6 md:px-8 py-3.5 border-b flex items-center justify-between gap-3 overflow-x-auto flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
      >
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Alerts', count: alerts.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'lead', label: 'New Leads', count: alerts.filter((a) => a.type === 'lead').length },
            { id: 'footprint', label: 'Digital Footprint', count: alerts.filter((a) => a.type === 'footprint').length },
            { id: 'critical', label: 'Critical Severity', count: alerts.filter((a) => a.severity === 'critical').length },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterCategory)}
                style={{
                  fontSize: '0.72rem',
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? '#C4622D' : 'var(--color-bg-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: isActive ? '1px solid #C4622D' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.label}</span>
                <span 
                  style={{
                    fontSize: '0.62rem',
                    fontFamily: 'IBM Plex Mono, monospace',
                    opacity: isActive ? 0.9 : 0.65,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            Showing {filteredAlerts.length} of {alerts.length} events
          </span>
        </div>
      </div>

      {/* ─── Alerts Stream List ──────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
        {groupedAlerts.length === 0 ? (
          /* Empty State */
          <div 
            className="flex flex-col items-center justify-center p-16 text-center rounded-lg border border-dashed my-8"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
          >
            <div 
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <ShieldAlert className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--color-text-primary)' }}>
              No alerts in this view
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, maxWidth: 320 }}>
              All trigger criteria are nominal. Change your filter to view active alerts.
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="btn-ghost mt-5"
                style={{ fontSize: '0.7rem' }}
              >
                View all alerts
              </button>
            )}
          </div>
        ) : (
          /* Grouped Alerts */
          <div className="flex flex-col gap-6">
            {groupedAlerts.map(({ group, items }) => (
              <div key={group}>
                {/* Date Group Header */}
                <div 
                  className="data-label mb-2 px-1"
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                  }}
                >
                  {group.toUpperCase()}
                </div>

                {/* Rows Container */}
                <div 
                  className="rounded-md border overflow-hidden shadow-sm"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
                >
                  {items.map((alert, idx) => {
                    const isExpanded = expandedId === alert.id;
                    const isKebabOpen = activeKebabId === alert.id;

                    return (
                      <div 
                        key={alert.id}
                        style={{
                          borderBottom: idx < items.length - 1 ? '1px solid var(--color-border)' : 'none',
                          background: alert.isRead ? 'var(--color-bg-surface)' : 'var(--color-bg-raised)',
                          transition: 'background-color 150ms ease',
                        }}
                      >
                        {/* Summary Header Row */}
                        <div 
                          onClick={() => handleRowClick(alert)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer group hover:bg-[var(--color-bg-hover)]"
                        >
                          {/* Unread Severity Dot */}
                          <div style={{ width: 8, height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!alert.isRead ? (
                              <span 
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: '50%',
                                  background: alert.severity === 'critical' ? 'var(--color-status-flagged)' : 'var(--color-status-active)',
                                }} 
                              />
                            ) : (
                              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-border)' }} />
                            )}
                          </div>

                          {/* Alert Type Icon */}
                          <div 
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 4,
                              background: 'var(--color-bg-base)',
                              border: '1px solid var(--color-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getAlertIcon(alert.type)}
                          </div>

                          {/* Title & Preview */}
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span 
                                style={{
                                  fontSize: 13,
                                  fontWeight: alert.isRead ? 500 : 700,
                                  color: 'var(--color-text-primary)',
                                  lineHeight: 1.3,
                                }}
                                className="truncate"
                              >
                                {alert.title}
                              </span>

                              {alert.caseId && (
                                <span 
                                  style={{
                                    fontSize: '0.62rem',
                                    fontFamily: 'IBM Plex Mono, monospace',
                                    color: '#C4622D',
                                    background: 'var(--color-status-active-bg)',
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                    border: '1px solid var(--color-status-active-border)',
                                  }}
                                >
                                  {alert.caseId}
                                </span>
                              )}
                            </div>

                            <p 
                              style={{
                                fontSize: 11.5,
                                color: 'var(--color-text-secondary)',
                                marginTop: 2,
                                lineHeight: 1.4,
                              }}
                              className="truncate"
                            >
                              {alert.preview}
                            </p>
                          </div>

                          {/* Severity Badge */}
                          <div className="hidden sm:block flex-shrink-0">
                            {getSeverityBadge(alert.severity)}
                          </div>

                          {/* Timestamp */}
                          <div 
                            style={{
                              fontSize: 11,
                              fontFamily: 'IBM Plex Mono, monospace',
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {alert.timestamp}
                          </div>

                          {/* Actions Kebab Menu */}
                          <div 
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setActiveKebabId(isKebabOpen ? null : alert.id)}
                              className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isKebabOpen && (
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '100%',
                                  width: 170,
                                  background: 'var(--color-bg-raised)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: 4,
                                  boxShadow: 'var(--shadow-dropdown)',
                                  zIndex: 30,
                                  overflow: 'hidden',
                                }}
                              >
                                {alert.isRead ? (
                                  <button
                                    onClick={() => {
                                      markAsUnread(alert.id);
                                      setActiveKebabId(null);
                                    }}
                                    className="case-menu-item w-full flex items-center gap-2 px-3 py-2 text-xs text-left"
                                    style={{ color: 'var(--color-text-primary)' }}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Mark as unread</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      markAsRead(alert.id);
                                      setActiveKebabId(null);
                                    }}
                                    className="case-menu-item w-full flex items-center gap-2 px-3 py-2 text-xs text-left"
                                    style={{ color: 'var(--color-text-primary)' }}
                                  >
                                    <MailOpen className="w-3.5 h-3.5" />
                                    <span>Mark as read</span>
                                  </button>
                                )}

                                {alert.caseId && (
                                  <button
                                    onClick={() => {
                                      handleOpenCase(alert.caseId!, alert.caseTitle);
                                      setActiveKebabId(null);
                                    }}
                                    className="case-menu-item w-full flex items-center gap-2 px-3 py-2 text-xs text-left"
                                    style={{ color: 'var(--color-text-primary)' }}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>View Case Dossier</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    dismissAlert(alert.id);
                                    setActiveKebabId(null);
                                  }}
                                  className="case-menu-item-destructive w-full flex items-center gap-2 px-3 py-2 text-xs text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Dismiss Alert</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details Section */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden border-t"
                              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
                            >
                              <div className="p-4 md:p-5 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <span className="data-label" style={{ color: 'var(--color-text-muted)' }}>
                                      Alert Telemetry Details · {alert.id}
                                    </span>
                                    <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginTop: 2 }}>
                                      {alert.preview}
                                    </div>
                                  </div>

                                  {alert.correlationScore && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>Correlation Score:</span>
                                      <span style={{
                                        fontFamily: 'IBM Plex Mono, monospace',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: '#C4622D',
                                        background: 'var(--color-status-active-bg)',
                                        border: '1px solid var(--color-status-active-border)',
                                        padding: '2px 8px',
                                        borderRadius: 3,
                                      }}>
                                        {alert.correlationScore}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Rule and Entities breakdown */}
                                {alert.details && (
                                  <div 
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded"
                                    style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                                  >
                                    {alert.details.ruleTriggered && (
                                      <div>
                                        <div className="data-label">Trigger Rule</div>
                                        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--color-text-primary)', marginTop: 2 }}>
                                          {alert.details.ruleTriggered}
                                        </div>
                                      </div>
                                    )}

                                    {alert.details.bankAccounts && (
                                      <div>
                                        <div className="data-label">Associated Accounts</div>
                                        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--color-status-flagged)', marginTop: 2 }}>
                                          {alert.details.bankAccounts.join(', ')}
                                        </div>
                                      </div>
                                    )}

                                    {alert.details.phoneNumbers && (
                                      <div>
                                        <div className="data-label">Subscriber Numbers</div>
                                        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#C4622D', marginTop: 2 }}>
                                          {alert.details.phoneNumbers.join(', ')}
                                        </div>
                                      </div>
                                    )}

                                    {alert.details.ipAddresses && (
                                      <div>
                                        <div className="data-label">Gateway IP Leases</div>
                                        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8C3D1A', marginTop: 2 }}>
                                          {alert.details.ipAddresses.join(', ')}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Bottom Action bar */}
                                <div className="flex items-center justify-between pt-1">
                                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                    Investigation Node: DL-SECTOR-09
                                  </span>

                                  {alert.caseId && (
                                    <button
                                      onClick={() => handleOpenCase(alert.caseId!, alert.caseTitle)}
                                      className="btn-accent flex items-center gap-1.5"
                                      style={{ padding: '6px 14px', fontSize: '0.72rem' }}
                                    >
                                      <span>Inspect Case Dossier</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default AlertsPage;
