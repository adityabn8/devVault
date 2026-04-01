import api from './api';

export const getMe = () => api.get('/auth/me');
export const logout = () => {
  localStorage.removeItem('dv_token');
  return api.post('/auth/logout');
};
