import { useEffect, useState, useCallback } from 'react';
import { carsApi } from '../api/carsApi';

// Хук для работы со списком автомобилей
export function useCars(search) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await carsApi.getCars(search);
      setCars(data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cars, loading, error, refresh };
}
