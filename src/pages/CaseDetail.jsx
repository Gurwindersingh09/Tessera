import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSentinelStore } from '../store/useSentinelStore';

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { cases, pushNavHistory } = useSentinelStore();
  const caseData = cases.find(c => c.id === caseId);

  useEffect(() => {
    if (caseData) {
      pushNavHistory({
        id: `case-${caseData.id}`,
        label: `Case: ${caseData.title}`,
        path: `/case/${caseData.id}`,
        depth: 1,
      });
    }
  }, [caseId]);

  if (!caseData) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0C' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#5A5A65', fontSize: 12, marginBottom: 12 }}>Case not found: {caseId}</div>
          <button className="btn-ghost" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0A0C', height: '100vh', overflowY: 'auto' }}>
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="data-label" style={{ marginBottom: 4 }}>Sentinel / Dashboard / {caseData.id}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8EE', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
            {caseData.title}
          </h1>
          <button className="btn-ghost" onClick={() => navigate('/')}>← Dashboard</button>
        </div>
      </header>

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Case ID',    value: caseData.id,           mono: true },
            { label: 'Status',     value: caseData.status,       mono: false },
            { label: 'Priority',   value: caseData.priority,     mono: false },
            { label: 'Entities',   value: caseData.entityCount,  mono: true },
            { label: 'Anomalies',  value: caseData.anomalyCount, mono: true },
            { label: 'Investigator', value: caseData.investigator, mono: false },
          ].map((f) => (
            <div key={f.label} style={{
              flex: 1,
              padding: '14px 20px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div className="data-label" style={{ marginBottom: 6 }}>{f.label}</div>
              <div style={{
                fontFamily: f.mono ? 'IBM Plex Mono, monospace' : 'Inter, sans-serif',
                fontSize: f.mono ? 16 : 14,
                color: '#E8E8EE',
                fontWeight: 500,
              }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38383F',
          fontSize: 12,
          fontFamily: 'IBM Plex Mono, monospace',
        }}>
          [CASE DETAIL CONTENT — PLACEHOLDER]
        </div>
      </div>
    </div>
  );
}
