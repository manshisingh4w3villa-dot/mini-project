import { API_BASE_URL } from '../services/api';

import { useState } from 'react';

export default function SocialLoginButtons({ disabled = false }) {
  const [loadingProvider, setLoadingProvider] = useState('');

  function continueWith(provider) {
    setLoadingProvider(provider);
    const authUrl = new URL(`${API_BASE_URL}/auth/${provider}`, window.location.href);
    authUrl.searchParams.set('frontend_origin', window.location.origin);
    window.location.assign(authUrl.toString());
  }

  return (
    <div className="social-auth" aria-label="Sign in with a social account">
      <div className="social-auth-divider"><span>or continue with</span></div>
      <div className="social-auth-actions">
        <button type="button" className="social-auth-button" disabled={disabled || Boolean(loadingProvider)} onClick={() => continueWith('google')}>
          {loadingProvider === 'google' ? <><span className="loading-spinner loading-spinner-button" aria-hidden="true" />Connecting...</> : <><span aria-hidden="true" className="social-auth-logo social-auth-google">G</span> Google</>}
        </button>
        <button type="button" className="social-auth-button" disabled={disabled || Boolean(loadingProvider)} onClick={() => continueWith('facebook')}>
          {loadingProvider === 'facebook' ? <><span className="loading-spinner loading-spinner-button" aria-hidden="true" />Connecting...</> : <><span aria-hidden="true" className="social-auth-logo social-auth-facebook">f</span> Facebook</>}
        </button>
      </div>
    </div>
  );
}
