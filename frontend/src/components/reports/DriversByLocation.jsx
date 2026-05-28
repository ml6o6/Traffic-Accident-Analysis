import { useState } from 'react';
import ReportCard from './ReportCard';
import { reportsApi } from '../../api/reportsApi';
import Badge from '../common/Badge';

export default function DriversByLocation() {
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(e) {
    e?.preventDefault();
    if (!location.trim()) return;
    setLoading(true);
    try {
      const r = await reportsApi.driversByLocation(location.trim());
      setData(r);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ReportCard number={2} title="Водители, участвовавшие в ДТП по указанному месту">
      <form className="inline-form" onSubmit={run}>
        <input
          placeholder="Введите адрес"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? '…' : 'Поиск'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {data && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Гос. номер</th>
              <th>Дата</th>
              <th>Место</th>
              <th>Вид</th>
              <th>Причина</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={`${r.driver_id}-${i}`}>
                <td>{r.full_name}</td>
                <td>{r.car_reg_number || '—'}</td>
                <td>{r.accident_date}</td>
                <td>{r.location}</td>
                <td><Badge value={r.accident_type} kind="type" /></td>
                <td><Badge value={r.accident_cause} kind="cause" /></td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" className="muted">Ничего не найдено</td></tr>
            )}
          </tbody>
        </table>
      )}
    </ReportCard>
  );
}
