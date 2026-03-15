import api from './api';

export const getVaults = (params) => api.get('/vaults', { params });
export const getVault = (id) => api.get(`/vaults/${id}`);
export const createVault = (data) => api.post('/vaults', data);
export const updateVault = (id, data) => api.put(`/vaults/${id}`, data);
export const deleteVault = (id) => api.delete(`/vaults/${id}`);
export const shareVault = (id, data) => api.post(`/vaults/${id}/share`, data);
export const removeCollaborator = (id, userId) => api.delete(`/vaults/${id}/share/${userId}`);
export const generateShareLink = (id) => api.post(`/vaults/${id}/share-link`);
export const deactivateShareLink = (id) => api.delete(`/vaults/${id}/share-link`);
export const getSharedVault = (token) => api.get(`/shared/${token}`);
