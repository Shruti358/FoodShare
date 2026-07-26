import { api } from './client';

export const donationsApi = {
  create: (formData) => api.post('/donations', formData, { isFormData: true }),
  listAvailable: () => api.get('/donations'),
  listMine: () => api.get('/donations/mine'),
  getOne: (id) => api.get(`/donations/${id}`),
  accept: (id) => api.patch(`/donations/${id}/accept`),
  reject: (id) => api.patch(`/donations/${id}/reject`),
  complete: (id) => api.patch(`/donations/${id}/complete`),
  cancel: (id) => api.del(`/donations/${id}`),
};
