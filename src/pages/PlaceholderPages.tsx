import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';

interface PlaceholderProps {
  title: string;
  path: string;
  description?: string;
}

function PlaceholderPage({ title, path, description }: PlaceholderProps) {
  const navigate = useNavigate();
  const { pushNavHistory } = usePhishieldStore();

  useEffect(() => {
    pushNavHistory({ id: title.toLowerCase(), label: title, path, depth: 0 });
  }, [title, path]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAF6F0', height: '100vh', overflowY: 'auto' }}>
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid #DDD5CA' }}>
        <div className="data-label" style={{ marginBottom: 4 }}>Phishield / {title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#2A2420', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
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
        color: '#A89F93',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 13,
        gap: 16
      }}>
        <div style={{ padding: '28px 52px', border: '1px solid #DDD5CA', background: '#F3EDE4', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ color: '#C4622D', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            System Module
          </div>
          <div style={{ color: '#2A2420', fontSize: 16, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, marginBottom: 6 }}>
            {title} Control Center
          </div>
          <div style={{ color: '#7A6F63', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
            {description ?? 'Real-time telemetry and advanced operational analytics.'}
          </div>
        </div>
        <button className="btn-accent" onClick={() => navigate('/dashboard')}>
          Go to Case Overview
        </button>
      </div>
    </div>
  );
}

export const AnalyticsPage: React.FC = () => <PlaceholderPage title="Analytics" path="/analytics" description="Cross-case behavioral trends, temporal clusters, and risk velocity." />;
export const AlertsPage: React.FC = () => <PlaceholderPage title="Alerts" path="/alerts" description="Automated anomaly notifications, threshold breaches, and urgent triggers." />;
export const SettingsPage: React.FC = () => <PlaceholderPage title="Settings" path="/settings" description="System configuration, API integrations, and access credentials." />;
export const SearchPage: React.FC = () => <PlaceholderPage title="Search" path="/search" />;
export const CasesPage: React.FC = () => <PlaceholderPage title="Cases Registry" path="/cases" />;
