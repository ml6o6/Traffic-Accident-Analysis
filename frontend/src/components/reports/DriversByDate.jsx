import { useState } from 'react';
import ReportCard from './ReportCard';
import { reportsApi } from '../../api/reportsApi';
import Badge from '../common/Badge';

export default function DriversByDate() {
  const [date, setDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(e) {
    e?.preventDefault();
    if (!date) return;
    setLoading(true);
    try {
      const r = await reportsApi.driversByDate(date);
      setData(r);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ReportCard number={3} title="Водители, участвовавшие в ДТП на указанную дату">
      <form className="inline-form" onSubmit={run}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
                <td>{r.location}</td>
                <td><Badge value={r.accident_type} kind="type" /></td>
                <td><Badge value={r.accident_cause} kind="cause" /></td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="5" className="muted">На эту дату ДТП не зарегистрировано</td></tr>
            )}
          </tbody>
        </table>
      )}
    </ReportCard>
  );
}
