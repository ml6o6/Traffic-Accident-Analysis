import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { statsApi } from '../../api/statsApi';
import { useStat } from '../../hooks/useStats';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export default function AccidentsByDay({ filters }) {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(6);

  const { data, loading } = useStat(
    () => statsApi.byDay(year, month, filters),
    [year, month, JSON.stringify(filters)],
  );

  return (
    <div>
      <div className="chart-controls">
        <label>
          <span>Год</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min="2020"
            max="2050"
          />
        </label>
        <label>
          <span>Месяц</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <div className="muted">Загрузка…</div>
      ) : !data?.length ? (
        <div className="muted">За указанный период данных нет</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'День', position: 'insideBottom', offset: -2 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2980b9" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
