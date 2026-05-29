import { useEffect, useState } from 'react';
import ReportCard from './ReportCard';
import { reportsApi } from '../../api/reportsApi';

export default function PedestrianDrivers() {
  const [minCount, setMinCount] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportsApi
      .pedestrianDrivers(minCount)
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [minCount]);

  return (
    <ReportCard number={5} title="Водители с наездами на пешехода">
      <div className="inline-form">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
          <span>Минимум наездов:</span>
          <input
            type="number"
            min="1"
            max="100"
            value={minCount}
            onChange={(e) => setMinCount(Math.max(1, Number(e.target.value) || 1))}
            style={{ width: 80 }}
          />
        </label>
      </div>
      {loading && <div className="muted">Загрузка…</div>}
      {error && <div className="error">{error}</div>}
      {data && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>№ удостоверения</th>
              <th>Наездов</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.driver_id}>
                <td>{r.full_name}</td>
                <td>{r.license_number}</td>
                <td><b>{r.pedestrian_count}</b></td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="3" className="muted">
                  Нет водителей с {minCount}+ наездами
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </ReportCard>
  );
}
