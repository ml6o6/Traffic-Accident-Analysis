import api from './axios';
// API для работы с ДТП
export const accidentsApi = {
  async getAccidents(filters = {}) {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    const { data } = await api.get('/accidents', { params });
    return data;
  },
  async getAccident(id) {
    const { data } = await api.get(`/accidents/${id}`);
    return data;
  },
  async createAccident(payload) {
    const { data } = await api.post('/accidents', payload);
    return data;
  },
  async updateAccident(id, payload) {
    const { data } = await api.put(`/accidents/${id}`, payload);
    return data;
  },
  async deleteAccident(id) {
    await api.delete(`/accidents/${id}`);
  },
  async getMapPoints(filters = {}) {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    const { data } = await api.get('/accidents/map-points', { params });
    return data;
  },
};
