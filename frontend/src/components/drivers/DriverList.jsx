import { useAuth } from '../../hooks/useAuth';
import { IconEdit, IconTrash } from '../common/Icons';

// Компонент для отображения списка водителей с сортируемыми заголовками
export default function DriverList({ drivers, onEdit, onDelete, sort, toggleSort }) {
  const { isAdmin } = useAuth();
  if (!drivers.length) {
    return <div className="empty">Водители не найдены</div>;
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
          <Th label="ФИО" field="full_name" />
          <Th label="Стаж" field="experience" />
          <Th label="Гос. номер" field="car_reg_number" />
          <Th label="№ удостоверения" field="license_number" />
          <Th label="Дата выдачи" field="license_date" />
          <Th label="№ акта" field="act_number" />
          {isAdmin && <th>Действия</th>}
        </tr>
      </thead>
      <tbody>
        {drivers.map((d) => (
          <tr key={d.id}>
            <td>{d.full_name}</td>
            <td>{d.experience}</td>
            <td>{d.car_reg_number || '—'}</td>
            <td>{d.license_number}</td>
            <td>{d.license_date}</td>
            <td>{d.act_number || '—'}</td>
            {isAdmin && (
              <td className="actions">
                <button className="btn btn--icon" onClick={() => onEdit(d)} title="Изменить">
                  <IconEdit />
                </button>
                <button className="btn btn--icon btn--danger" onClick={() => onDelete(d)} title="Удалить">
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
