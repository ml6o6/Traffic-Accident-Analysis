import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { statsApi } from '../../api/statsApi';
import { useStat } from '../../hooks/useStats';

export default function AccidentsByCause({ filters }) {
  const { data, loading } = useStat(
    () => statsApi.byCause(filters),
    [JSON.stringify(filters)],
  );
  if (loading) return <div className="muted">Загрузка…</div>;
  if (!data?.length) return <div className="muted">Нет данных</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="cause" width={220} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#34495e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
