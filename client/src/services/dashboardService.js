import api from './api';

export const getStats = () => api.get('/dashboard/stats');
export const getHeatmap = (days = 90) => api.get('/dashboard/heatmap', { params: { days } });
export const getActivity = (limit = 20) => api.get('/dashboard/activity', { params: { limit } });
export const getContinueLearning = () => api.get('/dashboard/continue');
