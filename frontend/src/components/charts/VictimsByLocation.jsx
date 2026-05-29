// Компонент для отображения статистики "Количество пострадавших по локациям"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { statsApi } from '../../api/statsApi';
import { useStat } from '../../hooks/useStats';

export default function VictimsByLocation() {
  const { data, loading } = useStat(() => statsApi.byLocation(10));
  if (loading) return <div className="muted">Загрузка…</div>;
  if (!data?.length) return <div className="muted">Нет данных</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="location"
          width={200}
          tick={{ fontSize: 11 }}
        />
        <Tooltip />
        <Bar dataKey="total_victims" fill="#c0392b" name="Пострадавших" />
      </BarChart>
    </ResponsiveContainer>
  );
}
