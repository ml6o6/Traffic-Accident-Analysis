// Универсальный хук для получения данных отчётов
// Принимает функцию fetcher, которая возвращает промис с данными отчёта
import { useEffect, useState } from 'react';

export function useReport(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}
