import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTesseraStore } from '../store/useTesseraStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { TesseraMark } from './TesseraMark';
import { PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── SVG Icons for 4 primary nav items ─────────────────────────────────────── */
const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const IconAnalytics = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 14V9M6 14V4M10 14V7M14 14V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconAlerts = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.5 1.5 4 3.5 4 6.5V9.5L2.5 11.5H13.5L12 9.5V6.5C12 3.5 10.5 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M6.5 12C6.7 13.2 7.2 14 8 14C8.8 14 9.3 13.2 9.5 12" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="12.5" cy="3.5" r="2" fill="#B53924"/>
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41"
      stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: IconDashboard },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: IconAnalytics },
  { id: 'alerts',    label: 'Alerts',    path: '/alerts',    icon: IconAlerts },
  { id: 'settings',  label: 'Settings',  path: '/settings',  icon: IconSettings },
];

const RECENT_ACTIVITIES = [
  { id: 'act-1', user: 'S. Petrov', action: 'flagged', target: 'CASE-0038', time: '2h ago', dotColor: '#B53924', caseId: 'CASE-0038' },
  { id: 'act-2', user: 'A. Lin', action: 'linked 3 entities in', target: 'CASE-0041', time: '4h ago', dotColor: '#C4622D', caseId: 'CASE-0041' },
  { id: 'act-3', user: 'M. Kelly', action: 'closed', target: 'CASE-0029', time: '1d ago', dotColor: '#3D7A4A', caseId: 'CASE-0029' },
  { id: 'act-4', user: 'R. Okafor', action: 'triaged anomalies in', target: 'CASE-0035', time: '2d ago', dotColor: '#D4854A', caseId: 'CASE-0035' },
];

const ONLINE_TEAM = [
  { initial: 'SP', name: 'S. Petrov', status: 'online', color: '#8C3D1A' },
  { initial: 'AL', name: 'A. Lin', status: 'online', color: '#C4622D' },
  { initial: 'MK', name: 'M. Kelly', status: 'online', color: '#6B2E12' },
  { initial: 'DK', name: 'D. Kim', status: 'idle', color: '#7A6F63' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { navigationHistory, truncateNavAt, pushNavHistory, cases, sidebarCollapsed, toggleSidebarCollapse } = useTesseraStore();
  const { setCaseId } = useAnalyticsStore();

  const currentPath = location.pathname;

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    pushNavHistory({ id: item.id, label: item.label, path: item.path, depth: 0 });
    navigate(item.path);
  };

  const handleHistoryClick = (entry: typeof navigationHistory[0]) => {
    truncateNavAt(entry.path);
    navigate(entry.path);
  };

  const handleActivityClick = (targetCaseId: string) => {
    const foundCase = cases.find(c => c.id === targetCaseId);
    if (foundCase) {
      setCaseId(foundCase.id);
      pushNavHistory({ id: `case-${foundCase.id}`, label: `Case: ${foundCase.title}`, path: `/case/${foundCase.id}`, depth: 1 });
      navigate(`/case/${foundCase.id}`);
    }
  };

  const hasSubPageHistory = navigationHistory.length > 1;
  const width = sidebarCollapsed ? 60 : 224;

  return (
    <aside
      style={{
        width,
        minWidth: width,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
        zIndex: 40,
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), min-width 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Top Header with Brand & Collapse Toggle Button */}
      <div 
        style={{
          padding: sidebarCollapsed ? '16px 12px' : '16px 14px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          gap: 8,
          background: 'var(--color-bg-surface)',
        }}
      >
        <div 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          title="Return to Landing Page"
        >
          <TesseraMark size={28} />
          {!sidebarCollapsed && (
            <div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                Tessera
              </div>
              <div className="data-label" style={{ marginTop: 1, fontSize: '0.58rem' }}>Intelligence Core</div>
            </div>
          )}
        </div>

        {/* Compress / Expand Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          title={sidebarCollapsed ? "Expand sidebar panel" : "Compress sidebar panel"}
          style={{
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            background: 'var(--color-bg-raised)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 120ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#C4622D';
            e.currentTarget.style.color = '#C4622D';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Primary Nav Items */}
      <nav style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: 10,
                padding: sidebarCollapsed ? '10px 0' : '7px 16px',
                background: isActive ? 'var(--color-bg-hover)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${isActive ? '#C4622D' : 'transparent'}`,
                color: isActive ? '#C4622D' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'color 100ms, background 100ms, border-left-color 100ms',
                fontFamily: 'Inter, sans-serif',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'var(--color-bg-hover)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <Icon />
              {!sidebarCollapsed && (
                <span style={{ fontSize: 12, letterSpacing: '0.01em' }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Middle Contextual Area (Activity Feed or Navigation Stack) */}
      {!sidebarCollapsed && (
        <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {hasSubPageHistory ? (
            <div>
              <div className="data-label" style={{ padding: '4px 16px 8px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                Navigation History
              </div>

              {navigationHistory.map((entry, idx) => {
                const isLast = idx === navigationHistory.length - 1;
                const indentPx = 16 + entry.depth * 12;

                return (
                  <button
                    key={`${entry.path}-${idx}`}
                    onClick={() => handleHistoryClick(entry)}
                    className={`nav-entry ${isLast ? 'active' : 'inactive'}`}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center',
                      padding: `5px 16px`, paddingLeft: indentPx,
                      background: 'transparent', border: 'none',
                      textAlign: 'left', position: 'relative',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {entry.depth > 0 && (
                      <span style={{
                        position: 'absolute',
                        left: indentPx - 10, top: '50%',
                        transform: 'translateY(-50%)',
                        width: 8, height: 1,
                        background: 'var(--color-border)',
                        display: 'block',
                      }} />
                    )}
                    {entry.depth > 0 && (
                      <span style={{
                        position: 'absolute',
                        left: indentPx - 10, top: 0, bottom: '50%',
                        width: 1, background: 'var(--color-border)',
                        display: 'block',
                      }} />
                    )}

                    <span style={{
                      fontSize: 11, letterSpacing: '0.01em',
                      color: isLast ? '#C4622D' : 'var(--color-text-secondary)',
                      fontFamily: entry.id?.startsWith('case-')
                        ? 'IBM Plex Mono, monospace'
                        : 'Inter, sans-serif',
                    }}>
                      {entry.label}
                    </span>

                    {isLast && (
                      <span style={{
                        marginLeft: 6, width: 4, height: 4,
                        borderRadius: '50%', background: '#C4622D',
                        display: 'inline-block', flexShrink: 0,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="data-label" style={{ padding: '4px 16px 8px', borderBottom: '1px solid var(--color-border)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Recent Activity</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C4622D' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px' }}>
                {RECENT_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => handleActivityClick(act.caseId)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 4,
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#C4622D';
                      e.currentTarget.style.background = 'var(--color-bg-raised)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'var(--color-bg-base)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: act.dotColor, display: 'inline-block', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 10.5, color: 'var(--color-text-primary)', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                        {act.user}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace' }}>
                        {act.time}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.3, paddingLeft: 10 }}>
                      {act.action} <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#8C3D1A', fontWeight: 500 }}>{act.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {sidebarCollapsed && (
        <div style={{ flex: 1 }} />
      )}

      {/* Team Online Presence Row */}
      {!sidebarCollapsed ? (
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'var(--color-bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="data-label" style={{ fontSize: '0.62rem' }}>Team Online</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: 'var(--color-status-closed)', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-status-closed)', display: 'inline-block' }} />
              4 ACTIVE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {ONLINE_TEAM.map((member) => (
              <div
                key={member.initial}
                title={`${member.name} (${member.status})`}
                style={{
                  position: 'relative',
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  background: 'var(--color-bg-raised)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: member.color,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'default',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                }}
              >
                {member.initial}
                <span
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 6.5,
                    height: 6.5,
                    borderRadius: '50%',
                    background: member.status === 'online' ? '#3D7A4A' : '#D4854A',
                    border: '1.5px solid var(--color-bg-raised)',
                    display: 'inline-block',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '10px 0',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}>
          {ONLINE_TEAM.slice(0, 2).map((member) => (
            <div
              key={member.initial}
              title={`${member.name} (${member.status})`}
              style={{
                position: 'relative',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8.5,
                fontWeight: 600,
                color: member.color,
              }}
            >
              {member.initial}
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: member.status === 'online' ? '#3D7A4A' : '#D4854A',
                  border: '1px solid var(--color-bg-raised)',
                  display: 'inline-block',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* User Profile Footer */}
      <div style={{
        padding: sidebarCollapsed ? '12px 0' : '12px 16px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        gap: 8,
        background: 'var(--color-bg-surface)',
      }}>
        <div style={{
          width: 24, height: 24,
          background: 'var(--color-bg-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 600, flexShrink: 0,
        }} title="R. Okafor (Lead Investigator)">
          RO
        </div>
        {!sidebarCollapsed && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>R. Okafor</div>
            <div className="data-label">Lead Investigator</div>
          </div>
        )}
      </div>
    </aside>
  );
};
