import api from './api';

export async function getLocations() {
  const response = await api.get('/locations');
  return response.data.locations;
}

export async function getLocationDetails(locationId) {
  const response = await api.get(`/locations/${locationId}`);
  return response.data;
}