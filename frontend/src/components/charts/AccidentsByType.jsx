import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statsApi } from '../../api/statsApi';
import { useStat } from '../../hooks/useStats';

const COLORS = ['#e74c3c', '#e67e22', '#c0392b', '#8e44ad', '#2980b9', '#d35400', '#7f8c8d'];

export default function AccidentsByType({ filters }) {
  const { data, loading } = useStat(
    () => statsApi.byType(filters),
    [JSON.stringify(filters)],
  );
  if (loading) return <div className="muted">Загрузка…</div>;
  if (!data?.length) return <div className="muted">Нет данных</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="type"
          cx="50%" cy="50%"
          outerRadius={100}
          label={(entry) => entry.count}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
