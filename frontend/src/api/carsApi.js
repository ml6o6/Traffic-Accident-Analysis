import api from './axios';

// API для работы с автомобилями
export const carsApi = {
  async getCars() {
    const { data } = await api.get('/cars');
    return data;
  },
};
