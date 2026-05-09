import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './authUtils';

const ADMIN_ROLES = ['admin', 'superadmin'];

export function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = getUserRole();
  const roleStr = Array.isArray(role) ? role[0] : role;
  if (!ADMIN_ROLES.includes(String(roleStr).toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
