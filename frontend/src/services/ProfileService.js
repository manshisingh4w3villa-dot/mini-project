import api from './api';

export async function getProfile() {
  const response = await api.get('/profile/me');
  return response.data.profile;
}

export async function updateProfile(details) {
  const response = await api.put('/profile/me', details);
  return response.data.profile;
}

export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/profile/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.profilePictureUrl;
}

export async function getAddressSuggestions(query) {
  const response = await api.get('/profile/address-suggestions', { params: { q: query } });
  return response.data.suggestions;
}

export async function getAddressDetails(placeId) {
  const response = await api.get(`/profile/address-details/${encodeURIComponent(placeId)}`);
  return response.data;
}

export async function downloadProfile() {
  const response = await api.get('/profile/export', { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nook-profile.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
