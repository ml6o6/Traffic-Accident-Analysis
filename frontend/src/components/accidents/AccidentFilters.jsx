// Компонент для отображения формы создания/редактирования ДТП
const TYPES = [
  'Наезд на пешехода', 'Наезд на препятствие', 'Столкновение',
  'Опрокидывание', 'Съезд с дороги', 'Наезд на велосипедиста', 'Прочее',
];
const CAUSES = [
  'Выезд на полосу встречного движения', 'Состояние водителя',
  'Неисправность автомобиля', 'Нарушение ПДД', 'Превышение скорости',
  'Плохие дорожные условия', 'Прочее',
];

export default function AccidentFilters({ value, onChange, onReset }) {
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
        <span>Вид</span>
        <select
          value={v.accident_type || ''}
          onChange={(e) => set('accident_type', e.target.value)}
        >
          <option value="">Все</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <span>Причина</span>
        <select
          value={v.accident_cause || ''}
          onChange={(e) => set('accident_cause', e.target.value)}
        >
          <option value="">Все</option>
          {CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>
        <span>Место</span>
        <input
          placeholder="Введите адрес"
          value={v.location || ''}
          onChange={(e) => set('location', e.target.value)}
        />
      </label>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Сбросить
      </button>
    </div>
  );
}
