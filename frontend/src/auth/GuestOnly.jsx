// src/components/GuestOnly.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './context';

export default function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Checking authentication...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}
