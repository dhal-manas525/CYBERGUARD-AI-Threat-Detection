import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { EmailAnalyzerPage } from './pages/EmailAnalyzerPage';
import { MessageAnalyzerPage } from './pages/MessageAnalyzerPage';
import { WebsiteAnalyzerPage } from './pages/WebsiteAnalyzerPage';
import { DigitalImpersonationPage } from './pages/DigitalImpersonationPage';
import { AuthAnomalyPage } from './pages/AuthAnomalyPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AssistantPage } from './pages/AssistantPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
        </Route>

        {/* Operational SOC Routes with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scan/url" element={<UrlScannerPage />} />
          <Route path="/scan/email" element={<EmailAnalyzerPage />} />
          <Route path="/scan/message" element={<MessageAnalyzerPage />} />
          <Route path="/scan/website" element={<WebsiteAnalyzerPage />} />
          
          {/* Hackathon Specific Demonstrable Scenarios & Workflows */}
          <Route path="/scan/impersonation" element={<DigitalImpersonationPage />} />
          <Route path="/scan/auth-anomaly" element={<AuthAnomalyPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />

          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
