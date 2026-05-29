import { useEffect, useRef, useState } from 'react';

const EMPTY = {
  brand_company: '',
  brand_model: '',
  body_type: 'седан',
  reg_number: '',
};

const BODY_TYPES = [
  'седан', 'хэтчбек', 'универсал', 'внедорожник',
  'кроссовер', 'купе', 'минивэн', 'пикап',
];

function buildBaseline(initial) {
  return initial ? { ...EMPTY, ...initial } : EMPTY;
}

export default function CarForm({ initial, onSubmit, onCancel, onDirtyChange }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const baselineRef = useRef(EMPTY);

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
      await onSubmit(form);
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
      <h3>{initial?.id ? 'Редактирование автомобиля' : 'Новый автомобиль'}</h3>
      <label><span>Фирма (производитель)</span>
        <input required value={form.brand_company}
          onChange={(e) => change('brand_company', e.target.value)} />
      </label>
      <label><span>Марка (модель)</span>
        <input required value={form.brand_model}
          onChange={(e) => change('brand_model', e.target.value)} />
      </label>
      <label><span>Тип кузова</span>
        <select value={form.body_type} onChange={(e) => change('body_type', e.target.value)}>
          {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      <label><span>Гос. номер</span>
        <input required value={form.reg_number}
          onChange={(e) => change('reg_number', e.target.value.toUpperCase())} />
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
