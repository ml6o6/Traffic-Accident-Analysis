import { useAuth } from '../../hooks/useAuth';
import { IconEdit, IconTrash } from '../common/Icons';

// Компонент для отображения списка автомобилей
export default function CarList({ cars, onEdit, onDelete }) {
  const { isAdmin } = useAuth();
  if (!cars.length) {
    return <div className="empty">Автомобили не найдены</div>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Фирма</th>
          <th>Модель</th>
          <th>Тип кузова</th>
          <th>Гос. номер</th>
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
                <button
                  className="btn btn--icon"
                  onClick={() => onEdit(c)}
                  title="Изменить"
                >
                  <IconEdit />
                </button>
                <button
                  className="btn btn--icon btn--danger"
                  onClick={() => onDelete(c)}
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
