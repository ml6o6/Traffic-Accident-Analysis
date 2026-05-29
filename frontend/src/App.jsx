import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DriversPage from './pages/DriversPage';
import CarsPage from './pages/CarsPage';
import AccidentsPage from './pages/AccidentsPage';
import ReportsPage from './pages/ReportsPage';
import StatisticsPage from './pages/StatisticsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

// Главный компонент приложения, который задаёт маршрутизацию и общую структуру страниц
export default function App() {
  return (
    <Routes>
      {/* Открытая часть: страница логина */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Защищённая часть: всё за ProtectedRoute */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/accidents" element={<AccidentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
