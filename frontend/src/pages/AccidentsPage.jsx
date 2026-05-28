import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAccidents } from '../hooks/useAccidents';
import { accidentsApi } from '../api/accidentsApi';
import AccidentList from '../components/accidents/AccidentList';
import AccidentFilters from '../components/accidents/AccidentFilters';
import AccidentForm from '../components/accidents/AccidentForm';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { IconPlus } from '../components/common/Icons';


// Страница для отображения списка ДТП, фильтров и форм для создания/редактирования
export default function AccidentsPage() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({});
  const { accidents, loading, error, refresh } = useAccidents(filters);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  
  // При начале редактирования загружаем полные данные по ДТП, чтобы в форме были все поля
  async function startEdit(item) {
    try {
      const full = await accidentsApi.getAccident(item.id);
      setEditing(full);
    } catch (e) {
      setEditing(item);
    }
  }

  async function handleSubmit(payload) {
    if (editing && editing !== 'new') {
      await accidentsApi.updateAccident(editing.id, payload);
    } else {
      await accidentsApi.createAccident(payload);
    }
    setEditing(null);
    refresh();
  }

  async function handleDelete() {
    try {
      await accidentsApi.deleteAccident(deleting.id);
      setDeleting(null);
      setDeleteError(null);
      refresh();
    } catch (e) {
      setDeleteError(e?.response?.data?.detail || e.message);
    }
  }

  function closeDeleteModal() {
    setDeleting(null);
    setDeleteError(null);
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>ДТП</h1>
        <div className="page__actions">
          {isAdmin && (
            <button className="btn btn--primary" onClick={() => setEditing('new')}>
              <IconPlus />
              Добавить
            </button>
          )}
        </div>
      </div>

      <AccidentFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Загрузка…</div>
      ) : (
        <AccidentList
          accidents={accidents}
          onEdit={startEdit}
          onDelete={(a) => setDeleting(a)}
        />
      )}

      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        <AccidentForm
          initial={editing === 'new' ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Удалить акт ДТП?"
        message={`Действие необратимо. Акт «${deleting?.act_number || ''}» будет удалён.`}
        error={deleteError}
      />
    </div>
  );
}
