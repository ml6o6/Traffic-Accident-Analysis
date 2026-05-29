import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../api/statsApi';
import KpiCard from '../components/dashboard/KpiCard';
import Sparkline from '../components/dashboard/Sparkline';
import Badge from '../components/common/Badge';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    statsApi
      .dashboard()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.detail || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page"><div className="loading">Загрузка дашборда…</div></div>;
  }
  if (error) {
    return <div className="page"><div className="error">{error}</div></div>;
  }
  if (!data) return null;

  const { current_period, previous_period, daily_counts, top_locations, recent_accidents } = data;

  return (
    <div className="page">
      <h1>Дашборд</h1>
      <p className="muted">Сводная аналитика: 30 дней к предыдущим 30</p>

      {/* KPI */}
      <div className="kpi-grid" style={{ marginTop: 16 }}>
        <KpiCard
          label="ДТП за 30 дней"
          value={current_period.accidents}
          prev={previous_period.accidents}
        />
        <KpiCard
          label="Пострадавших за 30 дней"
          value={current_period.victims}
          prev={previous_period.victims}
        />
        <KpiCard label="ДТП за предыдущие 30 дней" value={previous_period.accidents} />
        <KpiCard label="Пострадавших за предыдущие 30 дней" value={previous_period.victims} />
      </div>

      {/* Виджеты */}
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Динамика по дням</h3>
          <Sparkline data={daily_counts} />
        </div>

        <div className="widget">
          <h3>Топ-3 опасных места</h3>
          {top_locations.length === 0 ? (
            <div className="muted">Нет данных</div>
          ) : (
            <ol className="top-list">
              {top_locations.map((loc, i) => (
                <li key={loc.location}>
                  <span className="top-list__num">{i + 1}</span>
                  <span className="top-list__name">{loc.location}</span>
                  <span className="top-list__count">{loc.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="widget widget--wide">
          <h3>Последние ДТП</h3>
          {recent_accidents.length === 0 ? (
            <div className="muted">Нет данных</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>№ акта</th>
                  <th>Дата</th>
                  <th>Место</th>
                  <th>Вид</th>
                  <th>Пострадавшие</th>
                  <th>Водитель</th>
                </tr>
              </thead>
              <tbody>
                {recent_accidents.map((a) => (
                  <tr key={a.id}>
                    <td><Link to="/accidents">{a.act_number}</Link></td>
                    <td>{a.accident_date}</td>
                    <td>{a.location}</td>
                    <td><Badge value={a.accident_type} kind="type" /></td>
                    <td>{a.victims_count}</td>
                    <td>{a.driver_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
