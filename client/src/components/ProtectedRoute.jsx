import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import FullPageLoader from './FullPageLoader.jsx';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader label="Authenticating" minHeight="100vh" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
