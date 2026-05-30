import { useMemo, useState } from 'react';
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

// Нечувствительность к раскладке: визуально совпадающие кириллические
// буквы в гос. номерах и номерах прав сопоставляем с латиницей.
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

const EMPTY_FILTERS = {
  fio: '', reg: '', license: '', act: '',
  expMin: '', expMax: '',
  dateFrom: '', dateTo: '',
};

export default function DriversPage() {
  const { isAdmin } = useAuth();
  // Загружаем всех водителей; фильтрация и сортировка — на клиенте.
  const { drivers, loading, error, refresh } = useDrivers();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  function setFilter(field, val) {
    setFilters((f) => ({ ...f, [field]: val }));
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS);
  }

  // Раздельные фильтры по столбцам: текстовые + диапазон по стажу + диапазон по дате
  const filtered = useMemo(() => {
    const expMin = filters.expMin === '' ? null : Number(filters.expMin);
    const expMax = filters.expMax === '' ? null : Number(filters.expMax);
    return drivers.filter((d) => {
      if (!includesNorm(d.full_name, filters.fio)) return false;
      if (!includesNorm(d.car_reg_number, filters.reg)) return false;
      if (!includesNorm(d.license_number, filters.license)) return false;
      if (!includesNorm(d.act_number, filters.act)) return false;

      const exp = Number(d.experience ?? 0);
      if (expMin !== null && !Number.isNaN(expMin) && exp < expMin) return false;
      if (expMax !== null && !Number.isNaN(expMax) && exp > expMax) return false;

      const date = d.license_date || '';
      if (filters.dateFrom && date < filters.dateFrom) return false;
      if (filters.dateTo && date > filters.dateTo) return false;

      return true;
    });
  }, [drivers, filters]);

  // Сортировка → пагинация (поверх отфильтрованного списка)
  const { sortedItems, sort, toggleSort } = useSortable(filtered, 'id');
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

  const anyFilter = Object.values(filters).some((v) => v);

  return (
    <div className="page">
      <div className="page__header">
        <h1>Водители</h1>
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
          <span>ФИО</span>
          <input
            type="text"
            placeholder="Иванов"
            value={filters.fio}
            onChange={(e) => setFilter('fio', e.target.value)}
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
        <label>
          <span>№ удостоверения</span>
          <input
            type="text"
            placeholder="7712345678"
            value={filters.license}
            onChange={(e) => setFilter('license', e.target.value)}
          />
        </label>
        <label>
          <span>№ акта</span>
          <input
            type="text"
            placeholder="ДТП-2024-0001"
            value={filters.act}
            onChange={(e) => setFilter('act', e.target.value)}
          />
        </label>
        <label>
          <span>Стаж от</span>
          <input
            type="number"
            min="0"
            max="80"
            placeholder="0"
            value={filters.expMin}
            onChange={(e) => setFilter('expMin', e.target.value)}
          />
        </label>
        <label>
          <span>Стаж до</span>
          <input
            type="number"
            min="0"
            max="80"
            placeholder="80"
            value={filters.expMax}
            onChange={(e) => setFilter('expMax', e.target.value)}
          />
        </label>
        <label>
          <span>Выдано с</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
          />
        </label>
        <label>
          <span>Выдано по</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
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
