import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconLogout } from '../components/common/Icons';

// Навбар адаптируется к роли:
// - гость видит только публичные разделы (Главная, Карта, Статистика) и кнопку «Войти»;
// - админ — все разделы и кнопку «Выйти».
export default function MainLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar__brand">ДТП-Аналитика</div>
        <nav className="navbar__links">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/map">Карта</NavLink>
          <NavLink to="/statistics">Статистика</NavLink>
          {isAdmin && (
            <>
              <NavLink to="/drivers">Водители</NavLink>
              <NavLink to="/cars">Авто</NavLink>
              <NavLink to="/accidents">ДТП</NavLink>
              <NavLink to="/reports">Отчёты</NavLink>
            </>
          )}
        </nav>
        <div className="navbar__user">
          {user ? (
            <>
              <div className="avatar">{user.username?.[0]?.toUpperCase() || '?'}</div>
              <div className="navbar__userinfo">
                <div>{user.username}</div>
                <small className={`role role--${user.role}`}>{user.role}</small>
              </div>
              <button className="btn btn--icon" onClick={handleLogout} title="Выйти">
                <IconLogout />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary">Войти</Link>
          )}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
