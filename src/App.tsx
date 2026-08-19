import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { CaseDashboard } from './pages/CaseDashboard';
import { CaseDetail } from './pages/CaseDetail';
import { NewCasePage } from './pages/NewCasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SearchPage, CasesPage } from './pages/PlaceholderPages';
import { ThemeProvider } from './context/ThemeContext';

export function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/login';

  if (isLanding) {
    return (
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div 
        style={{ 
          display: 'flex', 
          height: '100vh', 
          background: 'var(--color-bg-base)', 
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          transition: 'background-color 200ms ease, color 200ms ease',
        }}
      >
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/dashboard" element={<CaseDashboard />} />
            <Route path="/new-case" element={<NewCasePage />} />
            <Route path="/case/:caseId" element={<CaseDetail />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cases" element={<CasesPage />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
