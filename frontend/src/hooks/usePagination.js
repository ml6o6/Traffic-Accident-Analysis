import { useState, useEffect, useMemo } from 'react';

// Клиентская пагинация: получает массив, возвращает только текущую страницу
export function usePagination(items, pageSize = 20) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  // Если текущая страница стала больше, чем общее количество страниц (например, после фильтрации), сбрасываем на 1
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    if (!items) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { pageItems, page, setPage, totalPages };
}
