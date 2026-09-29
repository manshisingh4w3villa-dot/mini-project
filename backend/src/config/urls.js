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
  const { hostname, protocol } = new URL(origin);
  return protocol === 'http:' && /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(hostname);
}

function isAllowedFrontendOrigin(origin) {
  const candidate = normalizeOrigin(origin);
  if (!candidate) return false;

  const configured = normalizeOrigin(process.env.FRONTEND_URL);
  if (configured && candidate === configured) return true;
  return process.env.NODE_ENV !== 'production' && isLoopbackOrigin(candidate);
}

function frontendUrl(req, requestedOrigin) {
  const configured = normalizeOrigin(process.env.FRONTEND_URL);
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