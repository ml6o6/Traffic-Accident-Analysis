import api from './axios';

// API для работы с автомобилями
export const carsApi = {
  async getCars(search) {
    const params = search ? { search } : {};
    const { data } = await api.get('/cars', { params });
    return data;
  },
  async getCar(id) {
    const { data } = await api.get(`/cars/${id}`);
    return data;
  },
  async createCar(payload) {
    const { data } = await api.post('/cars', payload);
    return data;
  },
  async updateCar(id, payload) {
    const { data } = await api.put(`/cars/${id}`, payload);
    return data;
  },
  async deleteCar(id) {
    await api.delete(`/cars/${id}`);
  },
};
