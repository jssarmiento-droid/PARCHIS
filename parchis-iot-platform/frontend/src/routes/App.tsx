import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AudiosPage } from '../pages/AudiosPage';
import { DashboardPage } from '../pages/DashboardPage';
import { GameHistoryPage } from '../pages/GameHistoryPage';
import { LoginPage } from '../pages/LoginPage';
import { WelcomePage } from '../pages/WelcomePage';
import { MonitoringPage } from '../pages/MonitoringPage';
import { NewGamePage } from '../pages/NewGamePage';
import { QuestionsPage } from '../pages/QuestionsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { DiagnosticsPage } from '../pages/DiagnosticsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/nueva-partida" element={<NewGamePage />} />
          <Route path="/monitoreo" element={<MonitoringPage />} />
          <Route path="/preguntas" element={<QuestionsPage />} />
          <Route path="/audios" element={<AudiosPage />} />
          <Route path="/historial" element={<GameHistoryPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/diagnostico" element={<DiagnosticsPage />} />
          <Route path="/configuracion" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
