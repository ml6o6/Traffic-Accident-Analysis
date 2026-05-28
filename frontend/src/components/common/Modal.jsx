// Компонент для отображения модального окна
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">×</button>
        {children}
      </div>
    </div>
  );
}
