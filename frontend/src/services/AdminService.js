import api from './api';

export async function getAdminUsers({ search, status, plan, page, pageSize }) {
  const response = await api.get('/admin/users', {
    params: { search, status, plan, page, pageSize },
  });
  return response.data;
}

export async function getAdminUser(userId) {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
}

export async function updateAdminUser(userId, details) {
  const response = await api.put(`/admin/users/${userId}`, details);
  return response.data.user;
}