import api from './api';

export async function signup({ email, password, first_name, last_name, address }) {
  const response = await api.post('/auth/signup', {
    email,
    password,
    firstName: first_name,
    lastName: last_name,
    address,
  });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function verifyEmail(token) {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
}

export async function resendVerification(email) {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
}