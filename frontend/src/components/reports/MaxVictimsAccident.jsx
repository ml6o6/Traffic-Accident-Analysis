import ReportCard from './ReportCard';
import { useReport } from '../../hooks/useReports';
import { reportsApi } from '../../api/reportsApi';
import Badge from '../common/Badge';

export default function MaxVictimsAccident() {
  const { data, loading, error } = useReport(reportsApi.maxVictimsAccident);
  return (
    <ReportCard number={4} title="Акт ДТП с максимальным числом пострадавших">
      {loading && <div className="muted">Загрузка…</div>}
      {error && <div className="error">{error}</div>}
      {data && (
        <div className="report-detail">
          <div><b>№ акта:</b> {data.act_number}</div>
          <div><b>Дата:</b> {data.accident_date}</div>
          <div><b>Место:</b> {data.location}</div>
          <div>
            <b>Пострадавших:</b>{' '}
            <span style={{ color: '#c0392b', fontWeight: 700, fontSize: '1.2em' }}>
              {data.victims_count}
            </span>
          </div>
          <div><b>Водитель:</b> {data.driver_full_name || '—'}</div>
          <div><b>Гос. номер:</b> {data.car_reg_number || '—'}</div>
          <div><b>Вид:</b> <Badge value={data.accident_type} kind="type" /></div>
          <div><b>Причина:</b> <Badge value={data.accident_cause} kind="cause" /></div>
        </div>
      )}
    </ReportCard>
  );
}
