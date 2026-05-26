import api from './axios';

export const authApi = {
  // POST /api/auth/login → { access_token, token_type, user }
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },

  // GET /api/auth/me → { id, username, role, is_active }
  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
