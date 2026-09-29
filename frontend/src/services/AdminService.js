import api from './api';

export async function getAdminUsers({ search, status, plan, page, pageSize }) {
  const response = await api.get('/admin/users', {
    params: { search, status, plan, page, pageSize },
  });
  return response.data;
}