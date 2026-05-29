// API для получения статистики ДТП с бэкенда
import api from './axios';

// Убирает из объекта пустые/null значения, чтобы не отправлять их в query
function clean(params) {
  const out = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) out[k] = v;
  });
  return out;
}

export const statsApi = {
  async byType(filters = {}) {
    const { data } = await api.get('/stats/by-type', { params: clean(filters) });
    return data;
  },
  async byCause(filters = {}) {
    const { data } = await api.get('/stats/by-cause', { params: clean(filters) });
    return data;
  },
  async byDay(year, month, filters = {}) {
    const { data } = await api.get('/stats/by-day', {
      params: { year, month, ...clean(filters) },
    });
    return data;
  },
  async byMonth(filters = {}) {
    const { data } = await api.get('/stats/by-month', { params: clean(filters) });
    return data;
  },
  async bySeverity(filters = {}) {
    const { data } = await api.get('/stats/by-severity', { params: clean(filters) });
    return data;
  },
  async byLocation(limit = 10, filters = {}) {
    const { data } = await api.get('/stats/by-location', {
      params: { limit, ...clean(filters) },
    });
    return data;
  },
  async summary(filters = {}) {
    const { data } = await api.get('/stats/summary', { params: clean(filters) });
    return data;
  },
  async dashboard() {
    const { data } = await api.get('/stats/dashboard');
    return data;
  },
};
