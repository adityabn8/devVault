import api from './api';

export const getProfile = () => api.get('/profile');
export const updatePreferences = (data) => api.put('/profile/preferences', data);
export const updateOnboarding = (completed) => api.put('/profile/onboarding', { completed });
export const deleteAccount = () => api.delete('/profile');
