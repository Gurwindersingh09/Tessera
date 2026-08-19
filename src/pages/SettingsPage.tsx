import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Sun,
  Moon,
  Bell,
  Lock,
  ShieldCheck,
  Download,
  Key,
  Check,
  Smartphone,
  Database,
  Save,
  RefreshCw,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, type: 'info' | 'success' | 'warning' = 'success', description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type, duration: 4000 }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Profile Form State
  const [profile, setProfile] = useState({
    name: 'Girish Garg',
    role: 'Senior Cyber Forensics Analyst',
    email: 'girishgarg@state.cybercrime.gov.in',
    badgeId: 'INV-0001-DEL',
    department: 'Cybercrime Investigation Cell',
    avatarInitials: 'GG',
    avatarBg: '#8C3D1A',
  });

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    leads: true,
    footprint: true,
    anomalies: true,
    statusChanges: false,
    soundEffects: false,
  });

  // Security Form State
  const [security, setSecurity] = useState({
    currentPasscode: '',
    newPasscode: '',
    confirmPasscode: '',
    twoFactorEnabled: true,
    sessionTimeout: '30m',
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile changes saved successfully', 'success');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      addToast(`Theme switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const nextVal = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: nextVal }));
    addToast(`Notification preference updated`, 'info');
  };

  const handle2FAToggle = () => {
    setSecurity((prev) => {
      const next = !prev.twoFactorEnabled;
      addToast(next ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled', next ? 'success' : 'warning');
      return { ...prev, twoFactorEnabled: next };
    });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPasscode && security.newPasscode !== security.confirmPasscode) {
      addToast('New security passcodes do not match', 'warning');
      return;
    }
    setSecurity((prev) => ({ ...prev, currentPasscode: '', newPasscode: '', confirmPasscode: '' }));
    addToast('Security policy and credentials updated', 'success');
  };

  const handleDownloadAuditLog = () => {
    const logData = {
      agency: 'State Cyber Crime Investigation Division',
      node: 'PHISHIELD-PROD-DEL-01',
      analyst: profile.name,
      badgeId: profile.badgeId,
      exportedAt: new Date().toISOString(),
      compliance: 'DPDP Act 2023 · Section 69B IT Act',
      sessionEvents: [
        { id: 'LOG-001', event: 'AUTHENTICATION_SUCCESS', timestamp: '2026-08-19T09:00:00Z', ip: '10.200.4.12' },
        { id: 'LOG-002', event: 'CASE_DOSSIER_ACCESSED', target: 'CASE-0038', timestamp: '2026-08-19T09:14:22Z' },
        { id: 'LOG-003', event: 'CDR_QUERY_EXECUTED', query: 'BTS Sector 62 Triangulation', timestamp: '2026-08-19T09:45:10Z' },
        { id: 'LOG-004', event: 'ANOMALY_FLAG_APPLIED', target: 'CASE-0041', timestamp: '2026-08-19T10:12:05Z' },
      ],
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phishield-audit-log-${profile.badgeId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Activity audit log downloaded (.json)', 'info');
  };

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden font-sans"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <header
        className="px-6 md:px-8 py-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="data-label">PHISHIELD</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>/</span>
            <span className="data-label" style={{ color: '#C4622D' }}>PREFERENCES & SECURITY</span>
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 600,
              fontFamily: '"Fraunces", Georgia, serif',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Settings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 4,
              background: 'var(--color-bg-raised)',
              border: '1px solid var(--color-border)',
              fontSize: '0.7rem',
              fontFamily: 'IBM Plex Mono, monospace',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D7A4A' }} />
            <span>DPDP ACT 2023 COMPLIANT</span>
          </div>
        </div>
      </header>

      {/* ─── Settings Content Cards Grid ─────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">

        {/* ── 1. SECTION: Appearance & Theme ──────────────────────────── */}
        <section
          className="rounded-lg border p-6 shadow-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-[#E8B896]" /> : <Sun className="w-4 h-4 text-[#C4622D]" />}
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Appearance & Workspace Mode
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                Choose between warm tonal cream and deep espresso dark themes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Light Mode Option */}
            <div
              onClick={() => handleThemeChange('light')}
              style={{
                border: `2px solid ${theme === 'light' ? '#C4622D' : 'var(--color-border)'}`,
                background: theme === 'light' ? 'rgba(196, 98, 45, 0.05)' : 'var(--color-bg-surface)',
                borderRadius: 8,
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="group"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: '#FAF6F0',
                    border: '1px solid #DDD5CA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sun className="w-4 h-4 text-[#C4622D]" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Light Theme
                  </div>
                </div>
              </div>

              {theme === 'light' && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#C4622D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check className="w-3 h-3 text-white stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Dark Mode Option */}
            <div
              onClick={() => handleThemeChange('dark')}
              style={{
                border: `2px solid ${theme === 'dark' ? '#C4622D' : 'var(--color-border)'}`,
                background: theme === 'dark' ? 'rgba(196, 98, 45, 0.15)' : 'var(--color-bg-surface)',
                borderRadius: 8,
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="group"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: '#0D0E10',
                    border: '1px solid #2A2C30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Moon className="w-4 h-4 text-[#E8B896]" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Dark Theme
                  </div>
                </div>
              </div>

              {theme === 'dark' && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#C4622D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check className="w-3 h-3 text-white stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. SECTION: Profile & Division Credentials ───────────────── */}
        <section
          className="rounded-lg border p-6 shadow-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User className="w-4 h-4 text-[#C4622D]" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Investigator Profile
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                Agency badge credentials and active analytical identity.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 max-w-2xl">
            {/* Avatar & Badge row */}
            <div className="flex items-center gap-4 p-3 rounded" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: profile.avatarBg,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {profile.avatarInitials}
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 600 }}>{profile.name}</div>
                <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-secondary)' }}>
                  Badge ID: {profile.badgeId} · {profile.department}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>Full Legal Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>Designation / Rank</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>Official Agency Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>Badge Number / Govt ID</label>
                <input
                  type="text"
                  value={profile.badgeId}
                  onChange={(e) => setProfile({ ...profile, badgeId: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                className="btn-accent flex items-center gap-1.5"
                style={{ padding: '8px 16px', fontSize: '0.72rem' }}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </section>

        {/* ── 3. SECTION: Real-Time Alerts & Notification Preferences ─── */}
        <section
          className="rounded-lg border p-6 shadow-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell className="w-4 h-4 text-[#C4622D]" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Intelligence Triggers & Notifications
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                Configure real-time notifications for automated investigative telemetry.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-2xl">
            {[
              {
                id: 'leads' as const,
                title: 'New Triangulation Leads',
                desc: 'Alert when subscriber BTS tower pings or concurrent WhatsApp sessions match target IMEIs.',
              },
              {
                id: 'footprint' as const,
                title: 'Digital Footprint Updates',
                desc: 'Alert when darknet handles, ProtonMail aliases, or hardware signatures link to existing dossiers.',
              },
              {
                id: 'anomalies' as const,
                title: 'High-Velocity Anomaly Flags',
                desc: 'Trigger alerts on rapid mule account split transfers and unverified e-SIM swaps.',
              },
              {
                id: 'statusChanges' as const,
                title: 'Supervisor Case Assignments & Status Overrides',
                desc: 'Notify when case priorities change to Critical or when team members attach new evidence.',
              },
            ].map((item) => {
              const enabled = notifications[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationToggle(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '12px 14px',
                    borderRadius: 6,
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  className="hover:border-[#C4622D] transition-colors"
                >
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {item.desc}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    style={{
                      width: 38,
                      height: 22,
                      borderRadius: 12,
                      background: enabled ? '#C4622D' : 'var(--color-border)',
                      position: 'relative',
                      transition: 'background-color 200ms ease',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        position: 'absolute',
                        top: 3,
                        left: enabled ? 19 : 3,
                        transition: 'left 200ms ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. SECTION: Security & Two-Factor Authentication ────────── */}
        <section
          className="rounded-lg border p-6 shadow-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock className="w-4 h-4 text-[#C4622D]" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Authentication & Security Policy
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                Passcode tokens, session timeouts, and hardware key policies.
              </p>
            </div>
          </div>

          <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-4 max-w-2xl">
            {/* 2FA Toggle Banner */}
            <div
              onClick={handle2FAToggle}
              className="flex items-center justify-between p-3.5 rounded cursor-pointer"
              style={{
                background: security.twoFactorEnabled ? 'rgba(61, 122, 74, 0.08)' : 'var(--color-bg-surface)',
                border: `1px solid ${security.twoFactorEnabled ? 'rgba(61, 122, 74, 0.3)' : 'var(--color-border)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#3D7A4A]" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {security.twoFactorEnabled ? 'Active · Authenticator App (RFC 6238 TOTP)' : 'Disabled · Passcode only'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 12,
                  background: security.twoFactorEnabled ? '#3D7A4A' : 'var(--color-border)',
                  position: 'relative',
                  transition: 'background-color 200ms ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    position: 'absolute',
                    top: 3,
                    left: security.twoFactorEnabled ? 19 : 3,
                    transition: 'left 200ms ease',
                  }}
                />
              </div>
            </div>

            {/* Session Timeout */}
            <div className="flex flex-col gap-1">
              <label className="data-label" style={{ fontSize: '0.62rem' }}>Inactivity Auto-Lock Interval</label>
              <select
                value={security.sessionTimeout}
                onChange={(e) => {
                  setSecurity({ ...security, sessionTimeout: e.target.value });
                  addToast(`Session auto-lock set to ${e.target.value}`, 'info');
                }}
                style={{ maxWidth: 260 }}
              >
                <option value="15m">15 minutes of inactivity</option>
                <option value="30m">30 minutes of inactivity</option>
                <option value="1h">1 hour of inactivity</option>
                <option value="4h">4 hours (End of shift)</option>
              </select>
            </div>

            {/* Passcode change inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>Current Passcode</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={security.currentPasscode}
                  onChange={(e) => setSecurity({ ...security, currentPasscode: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>New Token</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={security.newPasscode}
                  onChange={(e) => setSecurity({ ...security, newPasscode: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="data-label" style={{ fontSize: '0.62rem' }}>Confirm Token</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={security.confirmPasscode}
                  onChange={(e) => setSecurity({ ...security, confirmPasscode: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                className="btn-ghost flex items-center gap-1.5"
                style={{ padding: '8px 16px', fontSize: '0.72rem' }}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Security Policy</span>
              </button>
            </div>
          </form>
        </section>

        {/* ── 5. SECTION: Data Governance & Audit Log ─────────────────── */}
        <section
          className="rounded-lg border p-6 shadow-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database className="w-4 h-4 text-[#C4622D]" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Data Governance & Audit Trails
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                Immutable audit logs and legal forensic export compliance.
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded mb-5 flex items-start gap-3"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <Info className="w-4 h-4 text-[#C4622D] flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              All analytical queries, cross-database joins, and dossier modifications are cryptographically signed
              under Section 69B of the Information Technology Act and DPDP Act 2023 regulations. Audit records are
              retained in cold storage for 7 years.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadAuditLog}
              className="btn-accent flex items-center gap-1.5"
              style={{ padding: '8px 16px', fontSize: '0.72rem' }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download My Activity Log (.json)</span>
            </button>

            <button
              onClick={() => addToast('Local telemetry cache purged', 'info')}
              className="btn-ghost flex items-center gap-1.5"
              style={{ padding: '8px 16px', fontSize: '0.72rem' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Purge Local Telemetry Cache</span>
            </button>
          </div>
        </section>

      </main>

      {/* ─── Toast Container ─────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
export default SettingsPage;
