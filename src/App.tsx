import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { CaseDashboard } from './pages/CaseDashboard';
import { CaseDetail } from './pages/CaseDetail';
import { NewCasePage } from './pages/NewCasePage';
import { SearchPage, SettingsPage, CasesPage } from './pages/PlaceholderPages';

export function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isCaseDetail = location.pathname.startsWith('/case/');

  if (isLanding) {
    return <LandingPage />;
  }

  if (isCaseDetail) {
    return <CaseDetail />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0C', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/dashboard" element={<CaseDashboard />} />
          <Route path="/new-case"   element={<NewCasePage />} />
          <Route path="/search"     element={<SearchPage />} />
          <Route path="/settings"   element={<SettingsPage />} />
          <Route path="/cases"      element={<CasesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
