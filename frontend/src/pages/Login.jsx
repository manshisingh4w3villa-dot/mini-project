import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../services/AuthService';
import SocialLoginButtons from '../components/SocialLoginButtons';
import '../styles/Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryEmail = searchParams.get('email') || '';
  const isVerifiedFromQuery = searchParams.get('verified') === 'true';

  const [form, setForm] = useState({
    email: queryEmail || location.state?.email || '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Resend verification states
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [showManualResend, setShowManualResend] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;

    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (isUnverified) setIsUnverified(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendStatus('');
    setSubmitting(true);

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      const responseData = err.response?.data;
      const message = responseData?.error || 'Login failed. Please check your credentials.';

      if (responseData?.isUnverified || message.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification(targetEmail) {
    const emailToSend = targetEmail || form.email || manualEmail;
    if (!emailToSend) {
      setError('Please enter your email address to resend verification.');
      return;
    }

    setResending(true);
    setResendStatus('');

    try {
      const result = await resendVerification(emailToSend);
      setResendStatus(result.message || 'Verification email sent! Check your inbox.');
      setCooldown(45);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to resend verification email.';
      const developmentUrl = err.response?.data?.developmentVerificationUrl;
      setError(developmentUrl ? `${errMsg} Local verification link: ${developmentUrl}` : errMsg);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-split-layout">
      {/* Left Editorial / Showcase Panel */}
      <aside className="auth-showcase-panel" aria-label="Nook introduction">
        <div className="auth-showcase-bg" />
        <div className="auth-showcase-overlay" />

        <div className="auth-showcase-top">
          <Link className="auth-brand" to="/">
            <span className="auth-brand-mark">n</span>
            <span>nook<span className="auth-brand-dot">.</span></span>
          </Link>
          <span className="auth-pill-tag">Member portal</span>
        </div>

        <div className="auth-showcase-middle">
          <div className="auth-showcase-eyebrow">
            <span className="auth-eyebrow-dash" />
            CALM &amp; INSPIRING
          </div>
          <h2 className="auth-showcase-heading">
            Your workday,<br />
            <em>beautifully</em> placed.
          </h2>
          <p className="auth-showcase-desc">
            Sign in to reserve boutique hot desks, quiet studios, and team tables across London.
            Always prepared, calm, and ready for deep work.
          </p>

          <div className="auth-space-card">
            <div className="auth-space-info">
              <div className="auth-space-badge">✦</div>
              <div>
                <div className="auth-space-title">The Glasshouse</div>
                <div className="auth-space-subtitle">Shoreditch, London · Available today</div>
              </div>
            </div>
            <div className="auth-space-rate">
              <small>from</small>
              <strong>$18/hr</strong>
            </div>
          </div>
        </div>

        <div className="auth-showcase-bottom">
          <div className="auth-social-proof">
            <span className="auth-rating-stars">★★★★★</span>
            <span>4.9/5 from 2,000+ focused members</span>
          </div>
          <span>London · UK</span>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className="auth-form-panel">
        <div className="auth-panel-nav">
          <Link className="auth-back-link" to="/">
            <span>←</span> Back to nook
          </Link>
          <div className="auth-mobile-brand">
            <Link className="auth-brand" to="/" style={{ color: 'var(--auth-ink)' }}>
              <span className="auth-brand-mark">n</span>
              <span>nook<span className="auth-brand-dot">.</span></span>
            </Link>
          </div>
        </div>

        <div className="auth-card-wrapper">
          <header className="auth-header">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h1>Sign in</h1>
            <p>Access your bookings, profile, and reserved spaces.</p>
          </header>

          {/* Email Verified Banner */}
          {isVerifiedFromQuery && (
            <div className="auth-alert auth-alert-success" role="status">
              <span className="auth-alert-icon">✓</span>
              <div>
                <strong>Email verified!</strong>
                <div>Your email address has been successfully verified. Please sign in below.</div>
              </div>
            </div>
          )}

          {/* Location State Message */}
          {location.state?.message && !isVerifiedFromQuery && (
            <div className="auth-alert auth-alert-success" role="status">
              <span className="auth-alert-icon">✓</span>
              <div>
                <div>{location.state.message}</div>
                {location.state.developmentVerificationUrl && (
                  <a className="auth-development-link" href={location.state.developmentVerificationUrl}>
                    Continue with the local verification link
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Unverified Email Warning Callout */}
          {isUnverified && (
            <div className="auth-alert auth-alert-verification" role="alert">
              <div className="auth-verification-header">
                <span className="auth-verification-icon">✉</span>
                <span>Email verification required</span>
              </div>
              <div className="auth-verification-body">
                Please verify your email address before signing in. Check your inbox for the verification link.
              </div>
              <div className="auth-resend-action">
                <button
                  type="button"
                  className="btn-resend-link"
                  disabled={resending || cooldown > 0}
                  onClick={() => handleResendVerification(form.email)}
                >
                  {resending ? 'Sending link...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                </button>
                {resendStatus && <span className="resend-feedback">✓ {resendStatus}</span>}
              </div>
            </div>
          )}

          {/* General Error Message (when not unverified alert) */}
          {error && !isUnverified && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span className="auth-alert-icon">!</span>
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">
                <span>Email Address</span>
              </label>
              <div className="input-with-icon">
                <span className="field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  autoFocus={!form.email}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span>Password</span>
              </label>
              <div className="input-with-icon">
                <span className="field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          <SocialLoginButtons disabled={submitting} />

          {/* Dedicated Resend Verification Email Section */}
          <div className="auth-auxiliary-section">
            <button
              type="button"
              className="auth-resend-toggle"
              onClick={() => setShowManualResend(!showManualResend)}
            >
              {showManualResend ? 'Close email verification assistance' : 'Didn’t receive verification email? Resend link'}
            </button>

            {showManualResend && (
              <div className="auth-resend-box">
                <p>Enter the email address you registered with to receive a new activation link:</p>
                <div className="auth-resend-input-row">
                  <input
                    type="email"
                    placeholder="Enter registered email"
                    value={manualEmail || form.email}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-resend-link"
                    disabled={resending || cooldown > 0}
                    onClick={() => handleResendVerification(manualEmail || form.email)}
                  >
                    {resending ? 'Sending...' : cooldown > 0 ? `${cooldown}s` : 'Send'}
                  </button>
                </div>
                {resendStatus && (
                  <p style={{ color: '#137333', marginTop: '8px', fontSize: '12px', fontWeight: 600 }}>
                    ✓ {resendStatus}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="auth-card-footer">
            <p>
              Don't have an account yet? <Link to="/signup">Create one</Link>
            </p>
          </div>
        </div>

        <footer className="auth-panel-footer">
          <span>© nook workspace inc.</span>
          <span>Designed for focus</span>
        </footer>
      </main>
    </div>
  );
}
