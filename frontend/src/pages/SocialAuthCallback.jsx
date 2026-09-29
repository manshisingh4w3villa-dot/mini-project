import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function decodeUser(encoded) {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
}

export default function SocialAuthCallback() {
  const navigate = useNavigate();
  const { completeSocialLogin } = useAuth();
  const hasCompleted = useRef(false);
  const [result] = useState(() => {
    const values = new URLSearchParams(window.location.hash.slice(1));
    const providerError = values.get('error');
    const token = values.get('token');
    const user = values.get('user');
    if (providerError || !token || !user) {
      return { error: providerError || 'We could not complete social sign-in. Please try again.' };
    }
    try {
      return { token, user: decodeUser(user) };
    } catch {
      return { error: 'We could not complete social sign-in. Please try again.' };
    }
  });

  useEffect(() => {
    if (result.error || hasCompleted.current) return;
    hasCompleted.current = true;
    completeSocialLogin(result);
    navigate('/dashboard', { replace: true });
  }, [completeSocialLogin, navigate, result]);

  return (
    <main className="social-callback-page">
      <div className="social-callback-card">
        {result.error ? <><h1>Sign-in unavailable</h1><p>{result.error}</p><Link className="btn-primary" to="/login">Back to sign in</Link></> : <><span className="spinner" aria-hidden="true" /><h1>Finishing sign-in…</h1><p>We’re securely connecting your account.</p></>}
      </div>
    </main>
  );
}
