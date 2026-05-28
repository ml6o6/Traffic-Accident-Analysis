import { useAuth } from '../../hooks/useAuth';
import { IconEdit, IconTrash } from '../common/Icons';
import Badge from '../common/Badge';


// Компонент для отображения списка ДТП
export default function AccidentList({ accidents, onEdit, onDelete }) {
  const { isAdmin } = useAuth();
  if (!accidents.length) {
    return <div className="empty">ДТП не найдены</div>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>№ акта</th>
          <th>Дата</th>
          <th>Место</th>
          <th>Вид</th>
          <th>Причина</th>
          <th>Пострадавшие</th>
          <th>Водитель</th>
          <th>Гос. номер</th>
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
                <button
                  className="btn btn--icon"
                  onClick={() => onEdit(a)}
                  title="Изменить"
                >
                  <IconEdit />
                </button>
                <button
                  className="btn btn--icon btn--danger"
                  onClick={() => onDelete(a)}
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
