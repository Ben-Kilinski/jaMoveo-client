import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PlayerMainPage from './pages/PlayerMainPage';
import AdminMainPage from './pages/AdminMainPage';
import ResultsPage from './pages/ResultsPage';
import LivePage from './pages/LivePage';
import OnboardingPage from './pages/OnboardingPage';
import RequireAuth from './components/RequireAuth';
import AdminChordsEditor from './pages/AdminChordsEditor';

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      {/* Removido signup admin separado */}
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/player"
        element={
          <RequireAuth>
            <PlayerMainPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminMainPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/chords-editor/:id"
        element={
          <RequireAuth>
            <AdminChordsEditor />
          </RequireAuth>
        }
      />

      <Route path="/admin/results" element={<ResultsPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/live" element={<LivePage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
