import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center gap-3"
      style={{ backgroundColor: '#0a0f14', color: '#dee3ea' }}>
      <div className="spinner-border text-info" role="status">
        <span className="visually-hidden">Autenticando...</span>
      </div>
      <span className="small text-secondary">Autenticando...</span>
    </div>
  );
}
