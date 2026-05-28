import ReportCard from './ReportCard';
import { useReport } from '../../hooks/useReports';
import { reportsApi } from '../../api/reportsApi';

export default function PedestrianDrivers() {
  const { data, loading, error } = useReport(reportsApi.pedestrianDrivers);
  return (
    <ReportCard number={5} title="Водители с 3+ наездами на пешехода">
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
              <tr><td colSpan="3" className="muted">Нет таких водителей</td></tr>
            )}
          </tbody>
        </table>
      )}
    </ReportCard>
  );
}
