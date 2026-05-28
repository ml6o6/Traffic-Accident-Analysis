import api from './axios';
// API для получения отчётов по ДТП
export const reportsApi = {
  async multiAccidentDrivers() {
    const { data } = await api.get('/reports/multi-accident-drivers');
    return data;
  },
  async driversByLocation(location) {
    const { data } = await api.get('/reports/drivers-by-location', {
      params: { location },
    });
    return data;
  },
  async driversByDate(date) {
    const { data } = await api.get('/reports/drivers-by-date', {
      params: { date },
    });
    return data;
  },
  async maxVictimsAccident() {
    const { data } = await api.get('/reports/max-victims-accident');
    return data;
  },
  async pedestrianDrivers(minCount = 3) {
    const { data } = await api.get('/reports/pedestrian-drivers', {
      params: { min_count: minCount },
    });
    return data;
  },
  async causesByFrequency() {
    const { data } = await api.get('/reports/causes-by-frequency');
    return data;
  },
};
