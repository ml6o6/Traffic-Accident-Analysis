// API для получения статистики по ДТП
import api from './axios';

export const statsApi = {
  async byType() {
    const { data } = await api.get('/stats/by-type');
    return data;
  },
  async byCause() {
    const { data } = await api.get('/stats/by-cause');
    return data;
  },
  async byDay(year, month) {
    const { data } = await api.get('/stats/by-day', { params: { year, month } });
    return data;
  },
  async byLocation(limit = 10) {
    const { data } = await api.get('/stats/by-location', { params: { limit } });
    return data;
  },
  async summary() {
    const { data } = await api.get('/stats/summary');
    return data;
  },
};
