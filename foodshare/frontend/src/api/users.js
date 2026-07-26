import { api } from './client';

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (payload) => api.put('/users/profile', payload),
};

export const adminApi = {
  listUsers: (role) => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.del(`/admin/users/${id}`),
  listAllDonations: () => api.get('/admin/donations'),
  getStats: () => api.get('/admin/stats'),
};
