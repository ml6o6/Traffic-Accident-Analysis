export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const go = (p) => onChange(Math.max(1, Math.min(p, totalPages)));
  return (
    <div className="pagination">
      <button
        className="btn btn--ghost btn--sm"
        onClick={() => go(page - 1)}
        disabled={page === 1}
      >
        ← Назад
      </button>
      <span className="pagination__info">
        Страница {page} из {totalPages}
      </span>
      <button
        className="btn btn--ghost btn--sm"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
      >
        Вперёд →
      </button>
    </div>
  );
}
