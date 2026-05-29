// Компонент с фильтрами для карты
const TYPES = [
  'Наезд на пешехода', 'Наезд на препятствие', 'Столкновение',
  'Опрокидывание', 'Съезд с дороги', 'Наезд на велосипедиста', 'Прочее',
];

export default function MapFilters({ value, onChange, onReset }) {
  const v = value || {};
  function set(field, val) {
    onChange({ ...v, [field]: val });
  }
  return (
    <div className="map-filters">
      <h3>Фильтры карты</h3>
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
        <span>Вид ДТП</span>
        <select
          value={v.accident_type || ''}
          onChange={(e) => set('accident_type', e.target.value)}
        >
          <option value="">Все</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <span>Место</span>
        <input
          value={v.location || ''}
          onChange={(e) => set('location', e.target.value)}
          placeholder="Введите адрес"
        />
      </label>
      <button className="btn btn--ghost btn--full" onClick={onReset}>
        Сбросить
      </button>

      <div className="map-legend">
        <div><span className="dot dot--green" /> Без пострадавших</div>
        <div><span className="dot dot--orange" /> 1–2 пострадавших</div>
        <div><span className="dot dot--red" /> 3+ пострадавших</div>
      </div>
    </div>
  );
}
