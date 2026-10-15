import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

// Wraps any page that should only be visible to logged-in users.
// If there's no user, bounce to /login instead of rendering the page.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Checking your session..." fullScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}