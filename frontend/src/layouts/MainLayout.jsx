import { NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
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
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
