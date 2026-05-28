import Modal from './Modal';
// Компонент для отображения модального окна с подтверждением удаления
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, error }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>{title}</h3>
      <p style={{ margin: '12px 0 16px' }}>{message}</p>
      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="form__actions">
        <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn--danger" onClick={onConfirm}>Удалить</button>
      </div>
    </Modal>
  );
}
