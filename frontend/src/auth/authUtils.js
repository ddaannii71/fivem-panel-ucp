// Funciones de ayuda para la autenticacion
import { jwtDecode } from 'jwt-decode';

// Comprueba si hay un token valido en localStorage
// Si esta caducado lo borra y devuelve false
export function isAuthenticated() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const exp = decoded.exp;

    // Si tiene fecha de expiracion y ya ha pasado, lo borro
    if (exp && Date.now() >= exp * 1000) {
      localStorage.removeItem('jwt');
      return false;
    }

    return true;
  } catch (e) {
    // Si no se puede decodificar, no es valido
    return false;
  }
}

// Saca el rol del usuario del token JWT
// Devuelve null si no hay token o si no se puede leer
export function getUserRole() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode(token);
    // El backend puede usar varios nombres distintos para el rol
    if (payload.role) {
      return payload.role;
    }
    if (payload.roles) {
      return payload.roles;
    }
    if (payload.authorities) {
      return payload.authorities;
    }
    return null;
  } catch (e) {
    return null;
  }
}
