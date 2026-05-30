// Панель фильтров для страницы Статистика. Позволяет выбрать период, место, водителя
//  и тип ДТП для отображения на графиках и в таблице.
import { useEffect, useState } from 'react';
import { driversApi } from '../../api/driversApi';
import SearchableSelect from '../common/SearchableSelect';

const TYPES = [
  'Наезд на пешехода', 'Наезд на препятствие', 'Столкновение',
  'Опрокидывание', 'Съезд с дороги', 'Наезд на велосипедиста', 'Прочее',
];

export default function StatsFilters({ value, onChange, onReset }) {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    driversApi.getDrivers().then(setDrivers).catch(() => setDrivers([]));
  }, []);

  const v = value || {};
  function set(field, val) {
    onChange({ ...v, [field]: val });
  }

  return (
    <div className="filters">
      <label>
        <span>С даты</span>
        <input
          type="date"
          value={v.date_from || ''}
          onChange={(e) => set('date_from', e.target.value)}
        />
      </label>
      <label>
        <span>По дату</span>
        <input
          type="date"
          value={v.date_to || ''}
          onChange={(e) => set('date_to', e.target.value)}
        />
      </label>
      <label>
        <span>Место</span>
        <input
          placeholder="Часть адреса"
          value={v.location || ''}
          onChange={(e) => set('location', e.target.value)}
        />
      </label>
      <label style={{ minWidth: 220 }}>
        <span>Водитель</span>
        <SearchableSelect
          options={drivers.map((d) => ({
            value: String(d.id),
            label: `${d.full_name} — ${d.license_number}`,
          }))}
          value={v.driver_id ? String(v.driver_id) : ''}
          onChange={(val) => set('driver_id', val || '')}
          placeholder="Все"
        />
      </label>
      <label>
        <span>Вид ДТП</span>
        <select
          value={v.accident_type || ''}
          onChange={(e) => set('accident_type', e.target.value)}
        >
          <option value="">Все</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Сбросить
      </button>
    </div>
  );
}
