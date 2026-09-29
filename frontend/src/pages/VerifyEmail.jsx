import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/AuthService';
import '../styles/Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const hasVerified = useRef(false);
  const redirectDelayMs = 800;
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verifying your email address with nook...' : 'This verification link is missing its security token.'
  );

  useEffect(() => {
    if (!token || hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been successfully confirmed. You can now access your account and book workspaces.');
        window.setTimeout(() => navigate('/login?verified=true', { replace: true }), redirectDelayMs);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || 'This verification link is invalid, expired, or has already been used.';
        const alreadyVerified = /already verified|already confirmed|already been used|verified successfully/i.test(errorMessage);

        if (alreadyVerified) {
          setStatus('success');
          setMessage('This email has already been verified. Redirecting you to sign in.');
          window.setTimeout(() => navigate('/login?verified=true', { replace: true }), redirectDelayMs);
          return;
        }

        setStatus('error');
        setMessage(errorMessage);
      });
  }, [navigate, redirectDelayMs, token]);

  return (
    <div className="form-container">
      <div className="form-card verification-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link className="auth-brand" to="/" style={{ color: 'var(--auth-ink)' }}>
            <span className="auth-brand-mark">n</span>
            <span>nook<span className="auth-brand-dot">.</span></span>
          </Link>
        </div>

        <div className={`verification-icon verification-icon-${status}`} aria-hidden="true">
          {status === 'success' ? '✓' : status === 'error' ? '!' : '…'}
        </div>

        <div className="form-header">
          <p className="auth-eyebrow">
            {status === 'success'
              ? 'ACCOUNT READY'
              : status === 'error'
              ? 'ATTENTION REQUIRED'
              : 'PLEASE WAIT'}
          </p>
          <h2>
            {status === 'success'
              ? 'Email Verified'
              : status === 'error'
              ? 'Verification Failed'
              : 'Verifying Email...'}
          </h2>
          <p>{message}</p>
          {status === 'success' && <p>You’ll be redirected to sign in shortly.</p>}
        </div>

        {status === 'success' && (
          <Link className="btn-primary verification-link" to="/login?verified=true">
            Continue to Sign In →
          </Link>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link className="btn-primary verification-link" to="/login">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
