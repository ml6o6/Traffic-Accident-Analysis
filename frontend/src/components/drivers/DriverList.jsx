import { useAuth } from '../../hooks/useAuth';
import { IconEdit, IconTrash } from '../common/Icons';
// Компонент для отображения списка водителей
export default function DriverList({ drivers, onEdit, onDelete }) {
  const { isAdmin } = useAuth();
  if (!drivers.length) {
    return <div className="empty">Водители не найдены</div>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Стаж</th>
          <th>Гос. номер</th>
          <th>№ удостоверения</th>
          <th>Дата выдачи</th>
          <th>№ акта</th>
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
                <button
                  className="btn btn--icon"
                  onClick={() => onEdit(d)}
                  title="Изменить"
                >
                  <IconEdit />
                </button>
                <button
                  className="btn btn--icon btn--danger"
                  onClick={() => onDelete(d)}
                  title="Удалить"
                >
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
