import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDrivers } from '../hooks/useDrivers';
import { driversApi } from '../api/driversApi';
import DriverList from '../components/drivers/DriverList';
import DriverForm from '../components/drivers/DriverForm';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { IconPlus } from '../components/common/Icons';

export default function DriversPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const { drivers, loading, error, refresh } = useDrivers(search);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function handleSubmit(payload) {
    if (editing && editing !== 'new') {
      await driversApi.updateDriver(editing.id, payload);
    } else {
      await driversApi.createDriver(payload);
    }
    setEditing(null);
    refresh();
  }

  async function handleDelete() {
    await driversApi.deleteDriver(deleting.id);
    setDeleting(null);
    refresh();
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
        <DriverList
          drivers={drivers}
          onEdit={(d) => setEditing(d)}
          onDelete={(d) => setDeleting(d)}
        />
      )}

      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        <DriverForm
          initial={editing === 'new' ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Удалить водителя?"
        message={`Действие необратимо. Водитель «${deleting?.full_name || ''}» будет удалён.`}
      />
    </div>
  );
}
