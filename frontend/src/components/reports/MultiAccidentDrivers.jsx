import ReportCard from './ReportCard';
import Pagination from '../common/Pagination';
import { useReport } from '../../hooks/useReports';
import { usePagination } from '../../hooks/usePagination';
import { reportsApi } from '../../api/reportsApi';

export default function MultiAccidentDrivers() {
  const { data, loading, error } = useReport(reportsApi.multiAccidentDrivers);
  const { pageItems, page, setPage, totalPages } = usePagination(data || [], 10);

  return (
    <ReportCard number={1} title="Водители, участвовавшие в более чем одном ДТП">
      {loading && <div className="muted">Загрузка…</div>}
      {error && <div className="error">{error}</div>}
      {data && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>№ удостоверения</th>
                <th>Кол-во ДТП</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r) => (
                <tr key={r.driver_id}>
                  <td>{r.full_name}</td>
                  <td>{r.license_number}</td>
                  <td><b>{r.accident_count}</b></td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan="3" className="muted">Нет данных</td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </ReportCard>
  );
}
