import { useState, useMemo } from 'react';

// Сортировка массива объектов по полю. toggleSort переключает поле/направление.
export function useSortable(items, defaultField = null, defaultDir = 'asc') {
  const [sort, setSort] = useState({ field: defaultField, dir: defaultDir });

  const sortedItems = useMemo(() => {
    if (!items?.length) return [];
    if (!sort.field) return items;
    return [...items].sort((a, b) => {
      const av = a[sort.field];
      const bv = b[sort.field];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : 1;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [items, sort]);

  function toggleSort(field) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' },
    );
  }

  return { sortedItems, sort, toggleSort };
}
