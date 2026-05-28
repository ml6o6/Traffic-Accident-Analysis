import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DriversPage from './pages/DriversPage';
import ProtectedRoute from './components/common/ProtectedRoute';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
