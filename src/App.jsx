import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CaseDashboard from './pages/CaseDashboard';
import CaseDetail from './pages/CaseDetail';
import { NewCasePage, SearchPage, SettingsPage, CasesPage } from './pages/PlaceholderPages';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', background: '#0A0A0C', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/"           element={<CaseDashboard />} />
            <Route path="/case/:caseId" element={<CaseDetail />} />
            <Route path="/new-case"   element={<NewCasePage />} />
            <Route path="/search"     element={<SearchPage />} />
            <Route path="/settings"   element={<SettingsPage />} />
            <Route path="/cases"      element={<CasesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
