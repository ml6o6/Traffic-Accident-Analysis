import { useMemo, useState } from 'react';
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

// Нечувствительность к раскладке для гос. номеров: визуально совпадающие
// кириллические буквы сопоставляем с латиницей.
const CYR_TO_LAT = {
  а: 'a', в: 'b', е: 'e', к: 'k', м: 'm',
  н: 'h', о: 'o', р: 'p', с: 'c', т: 't',
  у: 'y', х: 'x',
};
function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .split('')
    .map((ch) => CYR_TO_LAT[ch] || ch)
    .join('')
    .trim();
}
function includesNorm(value, query) {
  if (!query) return true;
  return normalize(value).includes(normalize(query));
}

const EMPTY_FILTERS = { company: '', model: '', body: '', reg: '' };

// Страница для отображения списка автомобилей, фильтров и форм для создания/редактирования
export default function CarsPage() {
  const { isAdmin } = useAuth();
  const { cars, loading, error, refresh } = useCars();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  function setFilter(field, val) {
    setFilters((f) => ({ ...f, [field]: val }));
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS);
  }

  // раздельныt фильтры по столбцам
  const filtered = useMemo(() => {
    return cars.filter((c) => (
      includesNorm(c.brand_company, filters.company) &&
      includesNorm(c.brand_model, filters.model) &&
      includesNorm(c.body_type, filters.body) &&
      includesNorm(c.reg_number, filters.reg)
    ));
  }, [cars, filters]);

  const { sortedItems, sort, toggleSort } = useSortable(filtered, 'id');
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

  const anyFilter = Object.values(filters).some((v) => v);

  return (
    <div className="page">
      <div className="page__header">
        <h1>Авто</h1>
        <div className="page__actions">
          {isAdmin && (
            <button className="btn btn--primary" onClick={() => setEditing('new')}>
              <IconPlus />
              Добавить
            </button>
          )}
        </div>
      </div>

      {/* Раздельный поиск по 4 столбцам */}
      <div className="filters">
        <label>
          <span>Фирма</span>
          <input
            type="text"
            placeholder="Lada"
            value={filters.company}
            onChange={(e) => setFilter('company', e.target.value)}
          />
        </label>
        <label>
          <span>Модель</span>
          <input
            type="text"
            placeholder="Vesta"
            value={filters.model}
            onChange={(e) => setFilter('model', e.target.value)}
          />
        </label>
        <label>
          <span>Тип кузова</span>
          <input
            type="text"
            placeholder="Седан"
            value={filters.body}
            onChange={(e) => setFilter('body', e.target.value)}
          />
        </label>
        <label>
          <span>Гос. номер</span>
          <input
            type="text"
            placeholder="А123ВС77"
            value={filters.reg}
            onChange={(e) => setFilter('reg', e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={resetFilters}
          disabled={!anyFilter}
        >
          Сбросить
        </button>
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
