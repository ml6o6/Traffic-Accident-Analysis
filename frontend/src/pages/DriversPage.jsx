import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDrivers } from '../hooks/useDrivers';
import { useSortable } from '../hooks/useSortable';
import { usePagination } from '../hooks/usePagination';
import { driversApi } from '../api/driversApi';
import DriverList from '../components/drivers/DriverList';
import DriverForm from '../components/drivers/DriverForm';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { IconPlus } from '../components/common/Icons';

export default function DriversPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const { drivers, loading, error, refresh } = useDrivers(search);

  // Сортировка → пагинация
  const { sortedItems, sort, toggleSort } = useSortable(drivers, 'id');
  const { pageItems, page, setPage, totalPages } = usePagination(sortedItems, 20);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [formDirty, setFormDirty] = useState(false);

  async function handleSubmit(payload) {
    if (editing && editing !== 'new') {
      await driversApi.updateDriver(editing.id, payload);
    } else {
      await driversApi.createDriver(payload);
    }
    setEditing(null);
    setFormDirty(false);
    refresh();
  }

  function closeEditModal() {
    if (formDirty && !window.confirm('Несохранённые изменения будут потеряны. Закрыть форму?')) {
      return;
    }
    setEditing(null);
    setFormDirty(false);
  }

  async function handleDelete() {
    try {
      await driversApi.deleteDriver(deleting.id);
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
        <h1>Водители</h1>
        <div className="page__actions">
          <input
            className="search"
            type="text"
            placeholder="Поиск по ФИО…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <button className="btn btn--primary" onClick={() => setEditing('new')}>
              <IconPlus />
              Добавить
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Загрузка…</div>
      ) : (
        <>
          <DriverList
            drivers={pageItems}
            sort={sort}
            toggleSort={toggleSort}
            onEdit={(d) => setEditing(d)}
            onDelete={(d) => setDeleting(d)}
          />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal isOpen={!!editing} onClose={closeEditModal}>
        <DriverForm
          initial={editing === 'new' ? null : editing}
          onSubmit={handleSubmit}
          onCancel={closeEditModal}
          onDirtyChange={setFormDirty}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Удалить водителя?"
        message={`Действие необратимо. Водитель «${deleting?.full_name || ''}» будет удалён.`}
        error={deleteError}
      />
    </div>
  );
}
