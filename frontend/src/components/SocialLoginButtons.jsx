import { API_BASE_URL } from '../services/api';

export default function SocialLoginButtons({ disabled = false }) {
  function continueWith(provider) {
    const authUrl = new URL(`${API_BASE_URL}/auth/${provider}`, window.location.href);
    authUrl.searchParams.set('frontend_origin', window.location.origin);
    window.location.assign(authUrl.toString());
  }

  return (
    <div className="social-auth" aria-label="Sign in with a social account">
      <div className="social-auth-divider"><span>or continue with</span></div>
      <div className="social-auth-actions">
        <button type="button" className="social-auth-button" disabled={disabled} onClick={() => continueWith('google')}>
          <span aria-hidden="true" className="social-auth-logo social-auth-google">G</span> Google
        </button>
        <button type="button" className="social-auth-button" disabled={disabled} onClick={() => continueWith('facebook')}>
          <span aria-hidden="true" className="social-auth-logo social-auth-facebook">f</span> Facebook
        </button>
      </div>
    </div>
  );
}
