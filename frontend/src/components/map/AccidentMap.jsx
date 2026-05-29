import { useEffect, useRef, useState } from 'react';

const YANDEX_KEY = import.meta.env.VITE_YANDEX_MAPS_KEY || '';

// Загрузка API Яндекс.Карт с динамическим добавлением скрипта

let ymapsLoader = null;
function loadYmaps() {
  if (window.ymaps && window.ymaps.Map) return Promise.resolve(window.ymaps);
  if (ymapsLoader) return ymapsLoader;
  ymapsLoader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_KEY}&lang=ru_RU`;
    s.async = true;
    s.onload = () => {
      window.ymaps.ready(() => resolve(window.ymaps));
    };
    s.onerror = () => reject(new Error('Не удалось загрузить скрипт карты'));
    document.head.appendChild(s);
  });
  return ymapsLoader;
}

// Функция для экранирования текста в HTML

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '—';
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : s;
}

// Цвет метки и preset по числу пострадавших
function presetFor(victims) {
  if (victims >= 3) return 'islands#redIcon';
  if (victims >= 1) return 'islands#orangeIcon';
  return 'islands#greenIcon';
}

// Компонент карты

export default function AccidentMap({ points = [], center = [55.7558, 37.6176], zoom = 11 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const objectManagerRef = useRef(null);
  const [err, setErr] = useState(null);
  const [ready, setReady] = useState(false);

  // Инициализация карты один раз
  useEffect(() => {
    if (!YANDEX_KEY) {
      setErr('Не задан VITE_YANDEX_MAPS_KEY');
      return;
    }
    let cancelled = false;
    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;
        const map = new ymaps.Map(containerRef.current, {
          center,
          zoom,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector'],
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch((e) => setErr(e.message || 'Ошибка загрузки карты'));

    return () => {
      cancelled = true;
      try { mapRef.current?.destroy?.(); } catch (_) {}
      mapRef.current = null;
    };
  }, []);

  // Перерисовка точек при изменении массива
  useEffect(() => {
    if (!ready || !mapRef.current || !window.ymaps) return;
    const ymaps = window.ymaps;
    const map = mapRef.current;

    if (objectManagerRef.current) {
      try { map.geoObjects.remove(objectManagerRef.current); } catch (_) {}
      objectManagerRef.current = null;
    }
    if (!points.length) return;

    const objectManager = new ymaps.ObjectManager({
      clusterize: true,
      gridSize: 64,
      clusterDisableClickZoom: false,
    });
    objectManager.clusters.options.set('preset', 'islands#darkBlueClusterIcons');

    const features = points.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: { type: 'Point', coordinates: [p.lat, p.lon] },
      properties: {
        // Заголовок в балуне — тип ДТП, тело — место, дата, пострадавшие, подсказка при наведении — адрес
        balloonContentHeader: escapeHtml(p.accident_type),
        balloonContentBody: [
          escapeHtml(p.location),
          formatDate(p.accident_date),
          `Пострадавших: ${escapeHtml(p.victims_count)}`,
        ].join('<br />'),
        // Подсказка при наведении — адрес
        hintContent: escapeHtml(p.location),
      },
      options: {
        preset: presetFor(p.victims_count),
        iconContent: String(p.victims_count ?? 0),
      },
    }));

    objectManager.add({ type: 'FeatureCollection', features });
    map.geoObjects.add(objectManager);
    objectManagerRef.current = objectManager;

    // Если точек несколько, то подгоняем зум и центр, чтобы показать все
    if (features.length > 1) {
      const bounds = objectManager.getBounds();
      if (bounds) {
        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 30 });
      }
    }
  }, [points, ready]);

  if (err) return <div className="map-error">Карта недоступна: {err}</div>;

  return (
    <div className="map-wrapper">
      <div ref={containerRef} className="map-container" />
    </div>
  );
}
