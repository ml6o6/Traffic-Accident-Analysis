// Мини-график динамики ДТП за период
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';




export default function Sparkline({ data }) {
  if (!data?.length) {
    return <div className="muted">Нет данных за период</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
        <Tooltip
          labelFormatter={(label) => `Дата: ${label}`}
          formatter={(value) => [value, 'ДТП']}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2980b9"
          fill="#2980b9"
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
