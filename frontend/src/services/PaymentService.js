import api from './api';

export async function createCheckoutSession(plan) {
  const response = await api.post('/payments/create-checkout-session', { plan });
  return response.data.checkoutUrl;
}

export async function confirmSubscription(sessionId) {
  const response = await api.post('/payments/confirm-subscription', { sessionId });
  return response.data.profile;
}
