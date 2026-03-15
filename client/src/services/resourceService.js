import api from './api';

export const getResources = (params) => api.get('/resources', { params });
export const getResource = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);
export const extractMetadata = (url) => api.post('/resources/extract-metadata', { url });
export const moveResource = (id, vaultId) => api.put(`/resources/${id}/move`, { vault: vaultId });
