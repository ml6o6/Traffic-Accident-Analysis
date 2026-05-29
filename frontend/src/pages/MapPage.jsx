// Страница с картой и фильтрами для отображения ДТП
import { useState } from 'react';
import AccidentMap from '../components/map/AccidentMap';
import MapFilters from '../components/map/MapFilters';
import { useMapPoints } from '../hooks/useMapPoints';

export default function MapPage() {
  const [filters, setFilters] = useState({});
  const { points, loading } = useMapPoints(filters);

  return (
    <div className="map-page">
      <aside className="map-page__sidebar">
        <MapFilters
          value={filters}
          onChange={setFilters}
          onReset={() => setFilters({})}
        />
        <div className="muted" style={{ marginTop: 16 }}>
          {loading ? 'Загрузка…' : `На карте: ${points.length} точек`}
        </div>
      </aside>
      <div className="map-page__map">
        <AccidentMap points={points} />
      </div>
    </div>
  );
}
