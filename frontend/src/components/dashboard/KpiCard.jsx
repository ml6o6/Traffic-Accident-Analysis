// Компонент для отображения одного KPI с динамикой относительно прошлого периода
// Принимает label, value, prev (значение прошлого периода для расчёта тренда)
// Показывает стрелку и процент роста/падения. Зеленый цвет для улучшения, красный для ухудшения.
export default function KpiCard({ label, value, prev }) {
  let trend = null;
  if (prev !== undefined && prev !== null && prev > 0) {
    trend = Math.round(((value - prev) / prev) * 100);
  }

  const cls =
    trend === null || trend === 0
      ? ''
      : trend > 0
        ? 'kpi__trend--bad'
        : 'kpi__trend--good';
  const arrow = trend === null ? '' : trend > 0 ? '↑' : trend < 0 ? '↓' : '—';

  return (
    <div className="kpi">
      <div className="kpi__value">{value}</div>
      <div className="kpi__label">{label}</div>
      {trend !== null && (
        <div className={`kpi__trend ${cls}`}>
          {arrow} {Math.abs(trend)}% к прошлому периоду
        </div>
      )}
    </div>
  );
}
