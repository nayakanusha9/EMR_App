import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodaysSchedule from './pages/TodaysSchedule';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import VisitDetails from './pages/VisitDetails';
import CalendarPage from './pages/Calendar';
import ClinicalSearch from './pages/ClinicalSearch';
import Profile from './pages/Profile';
import About from './pages/About';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'receptionist') return <Navigate to="/patients" replace />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/schedule" element={<TodaysSchedule />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/patients/:id/visits/:visitId" element={<VisitDetails />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/clinical-search" element={<ClinicalSearch />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
