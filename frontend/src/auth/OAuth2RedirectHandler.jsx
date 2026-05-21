// Componente que recibe el token del login con Discord
// Se carga cuando Spring redirige al frontend despues del OAuth2
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Cuando se carga el componente, miro si viene un token en la URL
  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Si hay token, lo guardo y voy al dashboard
      localStorage.setItem('jwt', token);
      navigate('/dashboard', { replace: true });
    } else {
      // Si no hay token, redirijo al login con un error
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [searchParams, navigate]);

  // Muestro un spinner mientras se procesa
  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center gap-3"
      style={{ backgroundColor: '#0a0f14', color: '#dee3ea' }}
    >
      <div className="spinner-border text-info" role="status">
        <span className="visually-hidden">Autenticando...</span>
      </div>
      <span className="small text-secondary">Autenticando...</span>
    </div>
  );
}
