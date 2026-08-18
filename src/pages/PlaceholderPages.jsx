import React from 'react';
import { useNavigate } from 'react-router-dom';

function PlaceholderPage({ title, path }) {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0A0C', height: '100vh', overflowY: 'auto' }}>
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="data-label" style={{ marginBottom: 4 }}>Sentinel / {title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8EE', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
            {title}
          </h1>
          <button className="btn-ghost" onClick={() => navigate('/')}>← Dashboard</button>
        </div>
      </header>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#38383F',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 12,
      }}>
        [{title.toUpperCase()} — PLACEHOLDER ROUTE]
      </div>
    </div>
  );
}

export const NewCasePage    = () => <PlaceholderPage title="New Case"  path="/new-case" />;
export const SearchPage     = () => <PlaceholderPage title="Search"    path="/search" />;
export const SettingsPage   = () => <PlaceholderPage title="Settings"  path="/settings" />;
export const CasesPage      = () => <PlaceholderPage title="Cases"     path="/cases" />;
