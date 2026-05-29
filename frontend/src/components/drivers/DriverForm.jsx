import { useEffect, useRef, useState } from 'react';
import { carsApi } from '../../api/carsApi';

const EMPTY = {
  full_name: '',
  experience: 0,
  car_reg_number: '',
  license_number: '',
  license_date: '',
  act_number: '',
};

function buildBaseline(initial) {
  if (!initial) return EMPTY;
  return {
    ...EMPTY,
    ...initial,
    car_reg_number: initial.car_reg_number || '',
    act_number: initial.act_number || '',
  };
}

export default function DriverForm({ initial, onSubmit, onCancel, onDirtyChange }) {
  const [form, setForm] = useState(EMPTY);
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const baselineRef = useRef(EMPTY);

  useEffect(() => {
    carsApi.getCars().then(setCars).catch(() => setCars([]));
  }, []);

  useEffect(() => {
    const baseline = buildBaseline(initial);
    baselineRef.current = baseline;
    setForm(baseline);
    onDirtyChange?.(false);
  }, [initial]);

  // Сравниваем форму с baseline, чтобы понять, есть ли изменения
  useEffect(() => {
    if (!onDirtyChange) return;
    const dirty = JSON.stringify(form) !== JSON.stringify(baselineRef.current);
    onDirtyChange(dirty);
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
        experience: Number(form.experience) || 0,
        car_reg_number: form.car_reg_number || null,
        act_number: form.act_number || null,
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
      <h3>{initial?.id ? 'Редактирование водителя' : 'Новый водитель'}</h3>
      <label>
        <span>ФИО</span>
        <input required value={form.full_name} onChange={(e) => change('full_name', e.target.value)} />
      </label>
      <label>
        <span>Стаж (лет)</span>
        <input
          type="number" min="0" max="80"
          value={form.experience}
          onChange={(e) => change('experience', e.target.value)}
        />
      </label>
      <label>
        <span>Автомобиль</span>
        <select value={form.car_reg_number} onChange={(e) => change('car_reg_number', e.target.value)}>
          <option value="">— не выбрано —</option>
          {cars.map((c) => (
            <option key={c.id} value={c.reg_number}>
              {c.reg_number} — {c.brand_company} {c.brand_model}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>№ удостоверения</span>
        <input required value={form.license_number} onChange={(e) => change('license_number', e.target.value)} />
      </label>
      <label>
        <span>Дата выдачи удостоверения</span>
        <input required type="date" value={form.license_date}
          onChange={(e) => change('license_date', e.target.value)} />
      </label>
      <label>
        <span>№ акта о ДТП (опционально)</span>
        <input value={form.act_number} onChange={(e) => change('act_number', e.target.value)} />
      </label>
      {error && <div className="error">{error}</div>}
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Отмена</button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
