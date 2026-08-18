import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';

interface PlaceholderProps {
  title: string;
  path: string;
}

function PlaceholderPage({ title, path }: PlaceholderProps) {
  const navigate = useNavigate();
  const { pushNavHistory } = usePhishieldStore();

  useEffect(() => {
    pushNavHistory({ id: title.toLowerCase(), label: title, path, depth: 0 });
  }, [title, path]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0A0C', height: '100vh', overflowY: 'auto' }}>
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="data-label" style={{ marginBottom: 4 }}>Phishield / {title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8EE', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
            {title}
          </h1>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
      </header>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#5A5A65',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 13,
        gap: 16
      }}>
        <div style={{ padding: '24px 48px', border: '1px solid rgba(255,255,255,0.08)', background: '#0F0F12' }}>
          [{title.toUpperCase()} SYSTEM PANEL]
        </div>
        <button className="btn-accent" onClick={() => navigate('/dashboard')}>
          Go to Case Overview
        </button>
      </div>
    </div>
  );
}

export const SearchPage: React.FC = () => <PlaceholderPage title="Search" path="/search" />;
export const SettingsPage: React.FC = () => <PlaceholderPage title="Settings" path="/settings" />;
export const CasesPage: React.FC = () => <PlaceholderPage title="Cases Registry" path="/cases" />;
