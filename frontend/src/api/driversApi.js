import api from './axios';

export const driversApi = {
  async getDrivers(search) {
    const params = search ? { search } : {};
    const { data } = await api.get('/drivers', { params });
    return data;
  },
  async getDriver(id) {
    const { data } = await api.get(`/drivers/${id}`);
    return data;
  },
  async createDriver(payload) {
    const { data } = await api.post('/drivers', payload);
    return data;
  },
  async updateDriver(id, payload) {
    const { data } = await api.put(`/drivers/${id}`, payload);
    return data;
  },
  async deleteDriver(id) {
    await api.delete(`/drivers/${id}`);
  },
};
