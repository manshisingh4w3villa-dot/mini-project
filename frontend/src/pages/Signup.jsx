import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLoginButtons from '../components/SocialLoginButtons';
import '../styles/Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    address: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const data = await signup(form);
      navigate('/login', {
        state: {
          message: data.message || 'Account created! Please check your email for the verification link.',
          email: form.email,
          developmentVerificationUrl: data.developmentVerificationUrl,
        },
      });
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-split-layout">
      {/* Left Editorial / Showcase Panel */}
      <aside className="auth-showcase-panel" aria-label="Nook membership advantages">
        <div className="auth-showcase-bg" />
        <div className="auth-showcase-overlay" />

        <div className="auth-showcase-top">
          <Link className="auth-brand" to="/">
            <span className="auth-brand-mark">n</span>
            <span>nook<span className="auth-brand-dot">.</span></span>
          </Link>
          <span className="auth-pill-tag">New member</span>
        </div>

        <div className="auth-showcase-middle">
          <div className="auth-showcase-eyebrow">
            <span className="auth-eyebrow-dash" />
            JOIN THE COLLECTIVE
          </div>
          <h2 className="auth-showcase-heading">
            Work freely across<br />
            <em>inspiring spaces.</em>
          </h2>
          <p className="auth-showcase-desc">
            Join founders, creators, and teams booking calm desks and meeting rooms on demand.
            No long-term lease, no hidden friction.
          </p>

          <div className="auth-perks-list">
            <div className="auth-perk-item">
              <span className="auth-perk-bullet">✓</span>
              <span>Instant booking with live availability in top London locations</span>
            </div>
            <div className="auth-perk-item">
              <span className="auth-perk-bullet">✓</span>
              <span>Flexible plans: hourly desks, full-day passes, or monthly access</span>
            </div>
            <div className="auth-perk-item">
              <span className="auth-perk-bullet">✓</span>
              <span>Fast fiber internet, quiet zones, and specialty craft coffee</span>
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
            <span className="auth-eyebrow">GET STARTED</span>
            <h1>Create Account</h1>
            <p>Sign up to discover and reserve workspaces that elevate your focus.</p>
          </header>

          {/* Error Alert */}
          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span className="auth-alert-icon">!</span>
              <div>{error}</div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  <span>First Name</span>
                </label>
                <div className="input-with-icon">
                  <span className="field-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    placeholder="Jane"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  <span>Last Name</span>
                </label>
                <div className="input-with-icon">
                  <span className="field-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                <span>Address <small>(optional)</small></span>
              </label>
              <div className="input-with-icon">
                <span className="field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Street, city, and postal code"
                  value={form.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                />
              </div>
            </div>

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
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
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
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              <span className="field-hint">Must contain at least 8 characters.</span>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account →</span>
              )}
            </button>
          </form>

          <SocialLoginButtons disabled={submitting} />

          <div className="auth-card-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
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
