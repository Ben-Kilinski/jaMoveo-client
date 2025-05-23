import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import LivePage from './pages/LivePage';
import AdminMainPage from './pages/AdminMainPage';
import ResultsPage from './pages/ResultsPage';
import OnboardingPage from './pages/OnboardingPage';
import RequireAuth from './components/RequireAuth';
import AdminChordsEditor from './pages/AdminChordsEditor';
import Navbar from './components/Navbar';
import PlayerMainPage from './pages/PlayerMainPage';

export default function App() {
  const location = useLocation();

  // Páginas onde não queremos mostrar a Navbar
  const hideNavbar = ['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className={hideNavbar ? '' : 'pt-[72px]'}>

        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/player/:id"
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
      </div>
    </>
  );
}
