import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { statsApi } from '../../api/statsApi';
import { useStat } from '../../hooks/useStats';

const COLORS = ['#27ae60', '#f1c40f', '#e67e22', '#e74c3c', '#8b0000']; // Цвет столбика изменяется с тяжестью
 
export default function SeverityDistribution({ filters }) {
  const { data, loading } = useStat(
    () => statsApi.bySeverity(filters),
    [JSON.stringify(filters)],
  );
  if (loading) return <div className="muted">Загрузка…</div>;
  if (!data?.length) return <div className="muted">Нет данных</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          label={{ value: 'Пострадавших', position: 'insideBottom', offset: -2 }}
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" name="ДТП">
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
