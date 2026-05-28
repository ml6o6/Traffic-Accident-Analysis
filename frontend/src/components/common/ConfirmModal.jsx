import Modal from './Modal';
// Компонент для отображения окна подтверждения действия
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>{title}</h3>
      <p style={{ margin: '12px 0 24px' }}>{message}</p>
      <div className="form__actions">
        <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
        <button className="btn btn--danger" onClick={onConfirm}>Удалить</button>
      </div>
    </Modal>
  );
}
