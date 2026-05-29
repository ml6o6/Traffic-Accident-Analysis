import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { statsApi } from '../../api/statsApi';
import { useStat } from '../../hooks/useStats';

// Динамика ДТП по месяцам/годам — общий тренд за всё время
export default function AccidentsByMonth({ filters }) {
  const { data, loading } = useStat(
    () => statsApi.byMonth(filters),
    [JSON.stringify(filters)],
  );
  if (loading) return <div className="muted">Загрузка…</div>;
  if (!data?.length) return <div className="muted">Нет данных</div>;

  // Метка вида "2025-06" для XAxis
  const formatted = data.map((r) => ({
    ...r,
    label: `${r.year}-${String(r.month).padStart(2, '0')}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#27ae60"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="ДТП"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
