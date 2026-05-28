import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconLogout } from '../components/common/Icons';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar__brand">ДТП-Аналитика</div>
        <nav className="navbar__links">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/drivers">Водители</NavLink>
          <NavLink to="/cars">Авто</NavLink>
          <NavLink to="/accidents">ДТП</NavLink>
          <NavLink to="/map">Карта</NavLink>
          <NavLink to="/statistics">Статистика</NavLink>
          <NavLink to="/reports">Отчёты</NavLink>
        </nav>
        <div className="navbar__user">
          <div className="avatar">{user?.username?.[0]?.toUpperCase() || '?'}</div>
          <div className="navbar__userinfo">
            <div>{user?.username}</div>
            <small className={`role role--${user?.role}`}>{user?.role}</small>
          </div>
          <button className="btn btn--icon" onClick={handleLogout} title="Выйти">
            <IconLogout />
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
