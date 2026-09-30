function normalizeOrigin(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isLoopbackOrigin(origin) {
  if (!origin) return false;
  const { hostname } = new URL(origin);
  return /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(hostname);
}

function configuredFrontendOrigins() {
  return (process.env.FRONTEND_URL || '')
    .split(',')
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);
}

function isAllowedFrontendOrigin(origin) {
  const candidate = normalizeOrigin(origin);
  if (!candidate) return false;
  if (process.env.NODE_ENV === 'production' && isLoopbackOrigin(candidate)) return false;

  if (configuredFrontendOrigins().includes(candidate)) return true;
  return process.env.NODE_ENV !== 'production' && isLoopbackOrigin(candidate);
}

function frontendUrl(req, requestedOrigin) {
  const configured = configuredFrontendOrigins().find(
    (origin) => process.env.NODE_ENV !== 'production' || !isLoopbackOrigin(origin),
  );
  const refererOrigin = normalizeOrigin(req?.get?.('referer'));
  const candidate = normalizeOrigin(requestedOrigin || req?.get?.('origin') || refererOrigin);

  if (candidate && isAllowedFrontendOrigin(candidate)) return candidate;
  if (configured) return configured;
  throw new Error('FRONTEND_URL must be configured with the public frontend origin');
}

function apiUrl() {
  const configured = process.env.API_BASE_URL || process.env.APP_URL;
  if (!configured) throw new Error('API_BASE_URL or APP_URL must be configured for OAuth callback URLs');
  return new URL(configured).origin;
}

module.exports = { normalizeOrigin, isAllowedFrontendOrigin, frontendUrl, apiUrl };