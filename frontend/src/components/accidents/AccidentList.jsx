import { useAuth } from '../../hooks/useAuth';
import { IconEdit, IconTrash } from '../common/Icons';
import Badge from '../common/Badge';

// Компонент для отображения списка ДТП с сортируемыми заголовками
export default function AccidentList({ accidents, onEdit, onDelete, sort, toggleSort }) {
  const { isAdmin } = useAuth();
  if (!accidents.length) {
    return <div className="empty">ДТП не найдены</div>;
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
          <Th label="№ акта" field="act_number" />
          <Th label="Дата" field="accident_date" />
          <Th label="Место" field="location" />
          <Th label="Вид" field="accident_type" />
          <Th label="Причина" field="accident_cause" />
          <Th label="Пострадавшие" field="victims_count" />
          <Th label="Водитель" field="driver_name" />
          <Th label="Гос. номер" field="car_reg_number" />
          {isAdmin && <th>Действия</th>}
        </tr>
      </thead>
      <tbody>
        {accidents.map((a) => (
          <tr key={a.id}>
            <td>{a.act_number}</td>
            <td>{a.accident_date}</td>
            <td>{a.location}</td>
            <td><Badge value={a.accident_type} kind="type" /></td>
            <td><Badge value={a.accident_cause} kind="cause" /></td>
            <td>{a.victims_count}</td>
            <td>{a.driver_name || '—'}</td>
            <td>{a.car_reg_number || '—'}</td>
            {isAdmin && (
              <td className="actions">
                <button className="btn btn--icon" onClick={() => onEdit(a)} title="Изменить">
                  <IconEdit />
                </button>
                <button className="btn btn--icon btn--danger" onClick={() => onDelete(a)} title="Удалить">
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
