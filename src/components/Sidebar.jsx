import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSentinelStore } from '../store/useSentinelStore';

/* ─── SVG Icons ─────────────────────────────────────────────────────────────── */
const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
  </svg>
);

const IconCases = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="14" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 3V2.5C5 1.67 5.67 1 6.5 1h3C10.33 1 11 1.67 11 2.5V3" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="4" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.1"/>
    <line x1="4" y1="10" x2="9" y2="10" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

const IconChevron = ({ depth }) => (
  <span
    style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRight: '1px solid currentColor',
      borderBottom: '1px solid currentColor',
      transform: 'rotate(-45deg)',
      marginRight: 6,
      flexShrink: 0,
      opacity: 0.4,
      marginTop: -1,
    }}
  />
);

/* ─── SentinelMark ──────────────────────────────────────────────────────────── */
const SentinelMark = () => (
  <div
    style={{
      width: 28,
      height: 28,
      border: '1.5px solid rgba(95,168,211,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <span style={{ color: '#5FA8D3', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500, letterSpacing: '-0.05em' }}>S</span>
  </div>
);

/* ─── Nav Top Items ─────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: IconDashboard },
  { id: 'search',    label: 'Search',    path: '/search',   icon: IconSearch },
  { id: 'cases',     label: 'Cases',     path: '/cases',    icon: IconCases },
  { id: 'settings',  label: 'Settings',  path: '/settings', icon: IconSettings },
];

/* ─── Sidebar ────────────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const navigate = useNavigate();
  const { navigationHistory, truncateNavAt, pushNavHistory } = useSentinelStore();

  const currentPath = navigationHistory.at(-1)?.path ?? '/';

  const handleNavItemClick = (item) => {
    pushNavHistory({ id: item.id, label: item.label, path: item.path, depth: 0 });
    navigate(item.path);
  };

  const handleHistoryClick = (entry) => {
    truncateNavAt(entry.path);
    navigate(entry.path);
  };

  return (
    <aside
      style={{
        width: 224,
        minWidth: 224,
        background: '#0A0A0C',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* ── Logo / Mark ── */}
      <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <SentinelMark />
        <div>
          <div style={{ color: '#E8E8EE', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sentinel</div>
          <div className="data-label" style={{ marginTop: 1 }}>Investigative Analytics</div>
        </div>
      </div>

      {/* ── Top Nav ── */}
      <nav style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 16px',
                background: isActive ? 'rgba(95,168,211,0.07)' : 'transparent',
                border: 'none',
                borderLeft: `2px solid ${isActive ? '#5FA8D3' : 'transparent'}`,
                color: isActive ? '#5FA8D3' : '#5A5A65',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'color 100ms, background 100ms',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#9494A0'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#5A5A65'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <Icon />
              <span style={{ fontSize: 12, letterSpacing: '0.02em' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Navigation History ── */}
      <div style={{ flex: 1, padding: '10px 0' }}>
        <div className="data-label" style={{ padding: '4px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 4 }}>
          Navigation History
        </div>

        {navigationHistory.map((entry, idx) => {
          const isLast = idx === navigationHistory.length - 1;
          const isFirst = idx === 0;
          const indentPx = 16 + entry.depth * 12;

          return (
            <button
              key={`${entry.path}-${idx}`}
              onClick={() => handleHistoryClick(entry)}
              className={`nav-entry ${isLast ? 'active' : 'inactive'}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                padding: `5px ${indentPx}px`,
                paddingLeft: indentPx,
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                position: 'relative',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {/* Depth connector line */}
              {entry.depth > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    left: indentPx - 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8,
                    height: 1,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'block',
                  }}
                />
              )}
              {/* Vertical line for non-first items */}
              {entry.depth > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    left: indentPx - 10,
                    top: 0,
                    bottom: '50%',
                    width: 1,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'block',
                  }}
                />
              )}

              <span style={{
                fontSize: 11,
                letterSpacing: '0.01em',
                fontFamily: entry.id && entry.id.startsWith('case-') ? 'IBM Plex Mono, monospace' : 'Inter, sans-serif',
              }}>
                {entry.label}
              </span>

              {isLast && (
                <span style={{
                  marginLeft: 6,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#5FA8D3',
                  display: 'inline-block',
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 24,
          height: 24,
          background: '#1A1A20',
          border: '1px solid rgba(255,255,255,0.09)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#9494A0',
          fontWeight: 600,
          letterSpacing: 0,
          flexShrink: 0,
        }}>
          RO
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#E8E8EE', fontWeight: 500 }}>R. Okafor</div>
          <div className="data-label">Lead Investigator</div>
        </div>
      </div>
    </aside>
  );
}
