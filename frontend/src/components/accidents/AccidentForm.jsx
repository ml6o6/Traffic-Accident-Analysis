import { useEffect, useRef, useState } from 'react';
import { carsApi } from '../../api/carsApi';
import { driversApi } from '../../api/driversApi';
import SearchableSelect from '../common/SearchableSelect';

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

const EMPTY = {
  department_name: '',
  act_number: '',
  driver_id: '',
  car_reg_number: '',
  accident_date: '',
  location: '',
  latitude: '',
  longitude: '',
  victims_count: 0,
  accident_type: 'Столкновение',
  accident_cause: 'Превышение скорости',
  car_reg_numbers: [],
};

function buildBaseline(initial) {
  if (!initial) return EMPTY;
  return {
    ...EMPTY,
    ...initial,
    driver_id: initial.driver_id ?? '',
    car_reg_number: initial.car_reg_number || '',
    latitude: initial.latitude ?? '',
    longitude: initial.longitude ?? '',
    car_reg_numbers: initial.cars || [],
  };
}

export default function AccidentForm({ initial, onSubmit, onCancel, onDirtyChange }) {
  const [form, setForm] = useState(EMPTY);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const baselineRef = useRef(EMPTY);

  useEffect(() => {
    carsApi.getCars().then(setCars).catch(() => setCars([]));
    driversApi.getDrivers().then(setDrivers).catch(() => setDrivers([]));
  }, []);

  useEffect(() => {
    const baseline = buildBaseline(initial);
    baselineRef.current = baseline;
    setForm(baseline);
    onDirtyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    if (!onDirtyChange) return;
    const dirty = JSON.stringify(form) !== JSON.stringify(baselineRef.current);
    onDirtyChange(dirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  function change(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        driver_id: Number(form.driver_id),
        car_reg_number: form.car_reg_number || null,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        victims_count: Number(form.victims_count) || 0,
      };
      await onSubmit(payload);
      onDirtyChange?.(false);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  }


  return (
    <form className="form" onSubmit={submit}>
      <h3>{initial?.id ? 'Редактирование акта ДТП' : 'Новый акт ДТП'}</h3>

      <label>
        <span>Отделение</span>
        <input
          required
          value={form.department_name}
          onChange={(e) => change('department_name', e.target.value)}
        />
      </label>
      <label>
        <span>№ акта</span>
        <input
          required
          value={form.act_number}
          onChange={(e) => change('act_number', e.target.value)}
        />
      </label>
      <label>
        <span>Водитель</span>
        <SearchableSelect
          options={drivers.map((d) => ({
            value: String(d.id),
            label: `${d.full_name} — ${d.license_number}`,
          }))}
          value={form.driver_id !== '' ? String(form.driver_id) : ''}
          onChange={(v) => change('driver_id', v ? Number(v) : '')}
          placeholder="— выберите —"
        />
      </label>
      <label>
        <span>Основной автомобиль</span>
        <SearchableSelect
          options={cars.map((c) => ({
            value: c.reg_number,
            label: `${c.reg_number} — ${c.brand_company} ${c.brand_model}`,
          }))}
          value={form.car_reg_number}
          onChange={(v) => change('car_reg_number', v)}
          placeholder="— не выбрано —"
        />
      </label>
      <label>
        <span>Дата ДТП</span>
        <input
          required
          type="date"
          value={form.accident_date}
          onChange={(e) => change('accident_date', e.target.value)}
        />
      </label>
      <label>
        <span>Место</span>
        <input
          required
          value={form.location}
          onChange={(e) => change('location', e.target.value)}
        />
      </label>
      <div className="form__row">
        <label>
          <span>Широта</span>
          <input
            type="number"
            step="0.000001"
            value={form.latitude}
            onChange={(e) => change('latitude', e.target.value)}
          />
        </label>
        <label>
          <span>Долгота</span>
          <input
            type="number"
            step="0.000001"
            value={form.longitude}
            onChange={(e) => change('longitude', e.target.value)}
          />
        </label>
      </div>
      <label>
        <span>Пострадавших</span>
        <input
          type="number"
          min="0"
          value={form.victims_count}
          onChange={(e) => change('victims_count', e.target.value)}
        />
      </label>
      <label>
        <span>Вид ДТП</span>
        <select
          value={form.accident_type}
          onChange={(e) => change('accident_type', e.target.value)}
        >
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <span>Причина</span>
        <select
          value={form.accident_cause}
          onChange={(e) => change('accident_cause', e.target.value)}
        >
          {CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      {/* M:N — машины-участники: поиск + мультивыбор */}
      <label>
        <span>Машины-участники ({form.car_reg_numbers.length})</span>
        <SearchableSelect
          isMulti
          options={cars.map((c) => ({
            value: c.reg_number,
            label: `${c.reg_number} — ${c.brand_company} ${c.brand_model}`,
          }))}
          value={form.car_reg_numbers}
          onChange={(v) => change('car_reg_numbers', v)}
          placeholder={cars.length === 0 ? 'Сначала добавьте автомобили' : 'Найдите и выберите машины…'}
          isDisabled={cars.length === 0}
        />
      </label>

      {error && <div className="error">{error}</div>}
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
