import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any page that should only be visible to logged-in users.
// If there's no user, bounce to /login instead of rendering the page.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }}
          ></div>
          <p style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
            Loading...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}