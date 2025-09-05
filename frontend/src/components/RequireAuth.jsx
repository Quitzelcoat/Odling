// src/components/RequireAuth.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/context';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Checking authentication...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
