// Хук для получения точек ДТП для карты с учётом фильтров (дата, тип, место)
import { useEffect, useState } from 'react';
import { accidentsApi } from '../api/accidentsApi';

export function useMapPoints(filters) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    accidentsApi
      .getMapPoints(filters)
      .then((data) => { if (!cancelled) setPoints(data); })
      .catch(() => { if (!cancelled) setPoints([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };

  }, [JSON.stringify(filters)]);
  return { points, loading };
}
