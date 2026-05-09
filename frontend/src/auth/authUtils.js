import { jwtDecode } from 'jwt-decode';

export function isAuthenticated() {
  const token = localStorage.getItem('jwt');
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    if (exp && Date.now() >= exp * 1000) {
      localStorage.removeItem('jwt');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getUserRole() {
  const token = localStorage.getItem('jwt');
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    // El backend puede usar cualquiera de estos claims
    return payload.role ?? payload.roles ?? payload.authorities ?? null;
  } catch {
    return null;
  }
}
