import api from './api';

export async function createBooking(details) {
  const response = await api.post('/bookings', details);
  return response.data;
}

export async function getMyBookings() {
  const response = await api.get('/bookings/me');
  return response.data.bookings;
}

export async function confirmPaidBooking(sessionId) {
  const response = await api.post('/payments/confirm-booking', { sessionId });
  return response.data.booking;
}