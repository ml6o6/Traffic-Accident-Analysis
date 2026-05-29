import { useAuth } from '../../hooks/useAuth';
import { IconEdit, IconTrash } from '../common/Icons';

// Компонент для отображения списка автомобилей с сортируемыми заголовками
export default function CarList({ cars, onEdit, onDelete, sort, toggleSort }) {
  const { isAdmin } = useAuth();
  if (!cars.length) {
    return <div className="empty">Автомобили не найдены</div>;
  }

  function Th({ label, field }) {
    if (!toggleSort) return <th>{label}</th>;
    const active = sort?.field === field;
    const arrow = active ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';
    return (
      <th className="sortable" onClick={() => toggleSort(field)}>
        {label}{arrow}
      </th>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <Th label="Фирма" field="brand_company" />
          <Th label="Модель" field="brand_model" />
          <Th label="Тип кузова" field="body_type" />
          <Th label="Гос. номер" field="reg_number" />
          {isAdmin && <th>Действия</th>}
        </tr>
      </thead>
      <tbody>
        {cars.map((c) => (
          <tr key={c.id}>
            <td>{c.brand_company}</td>
            <td>{c.brand_model}</td>
            <td>{c.body_type}</td>
            <td>{c.reg_number}</td>
            {isAdmin && (
              <td className="actions">
                <button className="btn btn--icon" onClick={() => onEdit(c)} title="Изменить">
                  <IconEdit />
                </button>
                <button className="btn btn--icon btn--danger" onClick={() => onDelete(c)} title="Удалить">
                  <IconTrash />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
