import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { completeSocialLogin } = useAuth();
  const hasRun = useRef(false);

  const params = new URLSearchParams(window.location.hash.slice(1));
  const oauthError = params.get('error');
  const token = params.get('token');
  const encodedUser = params.get('user');

  useEffect(() => {
    if (hasRun.current || oauthError || !token || !encodedUser) return;
    hasRun.current = true;

    try {
      const user = JSON.parse(atob(encodedUser.replace(/-/g, '+').replace(/_/g, '/')));
      completeSocialLogin({ token, user });
      navigate('/dashboard', { replace: true });
    } catch {
      navigate('/login?error=signin', { replace: true });
    }
  }, [completeSocialLogin, navigate, oauthError, token, encodedUser]);

  if (oauthError) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{oauthError}</p>
        <a href="/login">Back to login</a>
      </div>
    );
  }

  if (!token || !encodedUser) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Missing sign-in details from the server.</p>
        <a href="/login">Back to login</a>
      </div>
    );
  }

  return <p style={{ textAlign: 'center', marginTop: 40 }}>Signing you in...</p>;
}