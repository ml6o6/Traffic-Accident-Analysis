// Универсальный компонент выпадающего списка с поиском, на основе react-select
import Select from 'react-select';

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    borderColor: state.isFocused ? '#2980b9' : '#e1e5ec',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(41,128,185,0.3)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#2980b9' : '#c8cdd5' },
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
    fontSize: '0.92rem',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#2980b9'
      : state.isFocused
        ? 'rgba(41,128,185,0.1)'
        : '#fff',
    color: state.isSelected ? '#fff' : '#2c3e50',
    cursor: 'pointer',
    padding: '8px 12px',
  }),
  placeholder: (base) => ({ ...base, color: '#7f8c8d' }),
  singleValue: (base) => ({ ...base, color: '#2c3e50' }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(41,128,185,0.12)',
    borderRadius: '4px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#2c3e50',
    fontSize: '0.88rem',
    padding: '2px 6px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#2980b9',
    cursor: 'pointer',
    ':hover': { backgroundColor: '#2980b9', color: '#fff' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  clearIndicator: (base) => ({ ...base, padding: '4px', cursor: 'pointer' }),
  dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
};

// Кириллические буквы, визуально совпадающие с латиницей
// нормализуем к латинскому ASCII, чтобы поиск работал независимо от раскладки
const CYR_TO_LAT = {
  'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm',
  'н': 'h', 'о': 'o', 'р': 'p', 'с': 'c', 'т': 't',
  'у': 'y', 'х': 'x',
};

function normalize(str) {
  return String(str)
    .toLowerCase()
    .split('')
    .map((ch) => CYR_TO_LAT[ch] || ch)
    .join('');
}

// Гибкий фильтр: строку запроса разбиваем на части по пробелам, и проверяем, что каждая часть есть в label (независимо от порядка)  
function flexibleFilter(option, rawInput) {
  if (!rawInput) return true;
  const input = normalize(rawInput).trim();
  const label = normalize(option.label || '');
  const parts = input.split(/\s+/).filter(Boolean);
  return parts.every((p) => label.includes(p));
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Выберите…',
  isClearable = true,
  isDisabled = false,
  isMulti = false,
}) {
  let selected;
  if (isMulti) {
    const values = Array.isArray(value) ? value.map(String) : [];
    selected = options.filter((o) => values.includes(String(o.value)));
  } else {
    selected = options.find((o) => String(o.value) === String(value ?? '')) || null;
  }

  function handleChange(opt) {
    if (isMulti) {
      onChange((opt || []).map((o) => o.value));
    } else {
      onChange(opt?.value ?? '');
    }
  }

  return (
    <Select
      options={options}
      value={selected}
      onChange={handleChange}
      styles={customStyles}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isMulti={isMulti}
      closeMenuOnSelect={!isMulti}
      placeholder={placeholder}
      noOptionsMessage={() => 'Нет совпадений'}
      loadingMessage={() => 'Загрузка…'}
      filterOption={flexibleFilter}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
    />
  );
}
