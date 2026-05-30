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
import MapPage from './pages/MapPage';
import ProtectedRoute from './components/common/ProtectedRoute';

// Главный компонент приложения. Доступ к страницам:
// - Публичные (Главная, Статистика, Карта) — без аутентификации;
// - Админские (Водители, Авто, ДТП, Отчёты) — требуют входа под admin.
export default function App() {
  return (
    <Routes>
      {/* Открытая часть: страница логина */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Основная разметка — доступна всем, конкретные страницы могут быть закрыты */}
      <Route element={<MainLayout />}>
        {/* Публичные страницы аналитики */}
        <Route path="/" element={<HomePage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/map" element={<MapPage />} />

        {/* Админские страницы — ведение справочников и оформление актов */}
        <Route
          path="/drivers"
          element={
            <ProtectedRoute adminOnly>
              <DriversPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars"
          element={
            <ProtectedRoute adminOnly>
              <CarsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accidents"
          element={
            <ProtectedRoute adminOnly>
              <AccidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute adminOnly>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
