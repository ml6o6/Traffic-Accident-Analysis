import { useEffect, useState, useCallback } from 'react';
import { accidentsApi } from '../api/accidentsApi';

// Хук для работы со списком ДТП
export function useAccidents(filters) {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accidentsApi.getAccidents(filters);
      setAccidents(data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { accidents, loading, error, refresh };
}
