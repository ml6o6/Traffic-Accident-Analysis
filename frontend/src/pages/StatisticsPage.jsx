import { useState } from 'react';
import { statsApi } from '../api/statsApi';
import { useStat } from '../hooks/useStats';
import StatsFilters from '../components/stats/StatsFilters';
import AccidentsByType from '../components/charts/AccidentsByType';
import AccidentsByCause from '../components/charts/AccidentsByCause';
import AccidentsByDay from '../components/charts/AccidentsByDay';
import AccidentsByMonth from '../components/charts/AccidentsByMonth';
import SeverityDistribution from '../components/charts/SeverityDistribution';
import VictimsByLocation from '../components/charts/VictimsByLocation';

export default function StatisticsPage() {
  const [filters, setFilters] = useState({});
  const filtersJson = JSON.stringify(filters);

  const { data: summary } = useStat(() => statsApi.summary(filters), [filtersJson]);

  return (
    <div className="page">
      <h1>Статистика</h1>

      <StatsFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      {/* KPI-карточки (тоже учитывают фильтры) */}
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

      {/* Графики (фильтры пробрасываются в каждый) */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Распределение по виду ДТП</h3>
          <AccidentsByType filters={filters} />
        </div>
        <div className="chart-card">
          <h3>Распределение по причинам</h3>
          <AccidentsByCause filters={filters} />
        </div>
        <div className="chart-card">
          <h3>Распределение по тяжести (пострадавшие)</h3>
          <SeverityDistribution filters={filters} />
        </div>
        <div className="chart-card">
          <h3>Топ-10 мест по числу пострадавших</h3>
          <VictimsByLocation filters={filters} />
        </div>
        <div className="chart-card chart-card--wide">
          <h3>Динамика ДТП по месяцам</h3>
          <AccidentsByMonth filters={filters} />
        </div>
        <div className="chart-card chart-card--wide">
          <h3>ДТП по дням выбранного месяца</h3>
          <AccidentsByDay filters={filters} />
        </div>
      </div>
    </div>
  );
}
