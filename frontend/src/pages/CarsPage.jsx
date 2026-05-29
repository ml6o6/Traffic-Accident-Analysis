import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCars } from '../hooks/useCars';
import { useSortable } from '../hooks/useSortable';
import { usePagination } from '../hooks/usePagination';
import { carsApi } from '../api/carsApi';
import CarList from '../components/cars/CarList';
import CarForm from '../components/cars/CarForm';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { IconPlus } from '../components/common/Icons';

export default function CarsPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const { cars, loading, error, refresh } = useCars(search);

  const { sortedItems, sort, toggleSort } = useSortable(cars, 'id');
  const { pageItems, page, setPage, totalPages } = usePagination(sortedItems, 20);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [formDirty, setFormDirty] = useState(false);

  async function handleSubmit(payload) {
    if (editing && editing !== 'new') {
      await carsApi.updateCar(editing.id, payload);
    } else {
      await carsApi.createCar(payload);
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
      await carsApi.deleteCar(deleting.id);
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
        <h1>Авто</h1>
        <div className="page__actions">
          <input
            className="search"
            type="text"
            placeholder="Поиск по марке или гос. номеру…"
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
          <CarList
            cars={pageItems}
            sort={sort}
            toggleSort={toggleSort}
            onEdit={(c) => setEditing(c)}
            onDelete={(c) => setDeleting(c)}
          />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal isOpen={!!editing} onClose={closeEditModal}>
        <CarForm
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
        title="Удалить автомобиль?"
        message={`Действие необратимо. Автомобиль «${deleting?.reg_number || ''}» (${deleting?.brand_company || ''} ${deleting?.brand_model || ''}) будет удалён.`}
        error={deleteError}
      />
    </div>
  );
}
