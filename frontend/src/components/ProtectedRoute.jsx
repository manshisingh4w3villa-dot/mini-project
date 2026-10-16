import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

// Wraps any page that should only be visible to logged-in users.
// If there's no user, bounce to /login instead of rendering the page.
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Checking your session..." fullScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole === 'admin' && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'customer' && user.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}