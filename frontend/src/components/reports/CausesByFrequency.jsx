import ReportCard from './ReportCard';
import { useReport } from '../../hooks/useReports';
import { reportsApi } from '../../api/reportsApi';

export default function CausesByFrequency() {
  const { data, loading, error } = useReport(reportsApi.causesByFrequency);
  return (
    <ReportCard number={6} title="Причины ДТП в порядке убывания">
      {loading && <div className="muted">Загрузка…</div>}
      {error && <div className="error">{error}</div>}
      {data && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Причина</th>
              <th>Кол-во</th>
              <th>% от общего</th>
              <th>Визуально</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.cause}>
                <td>{r.cause}</td>
                <td><b>{r.count}</b></td>
                <td>{r.percentage}%</td>
                <td style={{ width: '35%' }}>
                  <div className="progress">
                    <div
                      className="progress__fill"
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ReportCard>
  );
}
