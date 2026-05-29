import { statsApi } from '../api/statsApi';
import { useStat } from '../hooks/useStats';
import AccidentsByType from '../components/charts/AccidentsByType';
import AccidentsByCause from '../components/charts/AccidentsByCause';
import AccidentsByDay from '../components/charts/AccidentsByDay';
import VictimsByLocation from '../components/charts/VictimsByLocation';

export default function StatisticsPage() {
  const { data: summary } = useStat(statsApi.summary);

  return (
    <div className="page">
      <h1>Статистика</h1>

      {/* KPI-карточки */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi__value">{summary?.total_accidents ?? '…'}</div>
          <div className="kpi__label">Всего ДТП</div>
        </div>
        <div className="kpi">
          <div className="kpi__value">{summary?.total_victims ?? '…'}</div>
          <div className="kpi__label">Всего пострадавших</div>
        </div>
        <div className="kpi">
          <div className="kpi__value kpi__value--small">{summary?.top_type ?? '—'}</div>
          <div className="kpi__label">Самый частый вид</div>
        </div>
        <div className="kpi">
          <div className="kpi__value kpi__value--small">{summary?.top_cause ?? '—'}</div>
          <div className="kpi__label">Самая частая причина</div>
        </div>
      </div>

      {/* Графики */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Распределение по виду ДТП</h3>
          <AccidentsByType />
        </div>
        <div className="chart-card">
          <h3>Распределение по причинам</h3>
          <AccidentsByCause />
        </div>
        <div className="chart-card chart-card--wide">
          <h3>ДТП по дням месяца</h3>
          <AccidentsByDay />
        </div>
        <div className="chart-card chart-card--wide">
          <h3>Топ-10 мест по числу пострадавших</h3>
          <VictimsByLocation />
        </div>
      </div>
    </div>
  );
}
