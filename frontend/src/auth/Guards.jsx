// Componentes para proteger rutas
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './authUtils';

// Roles que pueden entrar al panel de admin
const ADMIN_ROLES = ['admin', 'superadmin'];

// Envuelve una ruta para que solo se vea si el usuario esta logueado
// Si no esta logueado, lo redirijo al login
export function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Envuelve una ruta para que solo la vean admins
// Si no esta logueado -> login. Si no es admin -> dashboard normal
export function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Saco el rol del usuario
  const role = getUserRole();

  // Si el rol viene como array (por algunas configuraciones), cojo el primero
  let roleStr;
  if (Array.isArray(role)) {
    roleStr = role[0];
  } else {
    roleStr = role;
  }

  // Compruebo si esta en la lista de roles admin
  const roleNormalizado = String(roleStr).toLowerCase();
  if (!ADMIN_ROLES.includes(roleNormalizado)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
