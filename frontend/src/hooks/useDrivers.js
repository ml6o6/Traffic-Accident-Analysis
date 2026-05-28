import { useEffect, useState, useCallback } from 'react';
import { driversApi } from '../api/driversApi';

export function useDrivers(search) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await driversApi.getDrivers(search);
      setDrivers(data);
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

  return { drivers, loading, error, refresh };
}
