// Pagina de inicio (landing) y tambien sirve para login
// Si la URL trae un token, lo guarda y redirige al dashboard
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Al cargar la pagina miro si vienen parametros en la URL
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Si hay token, lo guardo y voy al dashboard
      localStorage.setItem('jwt', token);
      navigate('/dashboard', { replace: true });
    } else if (error) {
      // Si hay error, lo dejo en la URL para que el usuario lo vea
      console.warn('OAuth2 error:', error);
    }
  }, [searchParams, navigate]);

  return (
    <div className="bg-dark text-light font-body" style={{ minHeight: '100vh' }}>

      {/* Barra de navegacion */}
      <nav className="navbar navbar-expand-md navbar-dark sticky-top" style={{ backgroundColor: 'rgba(15, 20, 25, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,209,255,0.2)' }}>
        <div className="container py-2">
          <span className="navbar-brand fs-4 fw-bold text-info text-uppercase" style={{ letterSpacing: '0.1em' }}>UCP SUITE</span>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto gap-3">
              <li className="nav-item"><a className="nav-link text-secondary" href="#">Economia</a></li>
              <li className="nav-item"><a className="nav-link text-secondary" href="#">Propiedades</a></li>
              <li className="nav-item"><a className="nav-link text-secondary" href="#">Facciones</a></li>
              <li className="nav-item"><a className="nav-link text-secondary" href="#">Tienda</a></li>
            </ul>
            {/* Boton de login con Discord */}
            <a
              href="http://localhost:8080/oauth2/authorization/discord"
              className="btn btn-info fw-bold text-dark px-4"
            >
              Login con Discord
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero principal */}
        <section className="position-relative d-flex align-items-center py-5 overflow-hidden" style={{ minHeight: '100vh' }}>
          <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
            <img
              className="w-100 h-100 object-fit-cover opacity-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8UiOqA7utGyl1MBHP3jGjCWpyPkx7JlUbjfgjzwBgvzAgD2XvEZPQTFmw4UcPMe6-mXFuoJvMfXpFri58qmUr7Vady9uf6TgkJIdowAYHmwQL1GMeh46Sq5a2KJdC7jN-5-RzZsMMPxRHtKSqaijusV3sf1d13rKdxLcM4Mk1tAxjeZIWCXzQ5NKISzZQktGWTzWixWfQBBZcQX07emRM835pmIR-Mpl_lSR41hTg4SJPcTAZWoVdoR5bEzmIpAlj6KbAm_yfk4A9"
              alt="Cinematic night cityscape"
            />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, #0a0f14, transparent)' }} />
          </div>

          <div className="container position-relative z-1 py-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border border-info mb-4" style={{ backgroundColor: 'rgba(0, 209, 255, 0.1)' }}>
                  <span className="spinner-grow spinner-grow-sm text-info" role="status" aria-hidden="true"></span>
                  <span className="text-info small fw-bold text-uppercase">Servidor activo</span>
                </div>

                <h1 className="display-1 fw-bold lh-1 mb-4">
                  TOMA EL <br />
                  <span className="text-info azure-glow">CONTROL</span><br />
                  DE TU VIDA
                </h1>

                <p className="lead text-secondary mb-5 border-start border-info border-3 ps-3">
                  Experimenta el siguiente nivel de simulacion urbana. Gestiona tus activos, lidera organizaciones y domina la economia digital con el panel de control mas avanzado del ecosistema.
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <button className="btn btn-info btn-lg fw-bold px-4 d-flex align-items-center gap-2 text-dark shadow">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    EMPEZAR AHORA
                  </button>
                  <a
                    href="http://localhost:8080/oauth2/authorization/discord"
                    className="btn discord-btn btn-lg fw-bold text-white px-4 d-flex align-items-center gap-2 shadow"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>forum</span>
                    UNIRSE AL DISCORD
                  </a>
                </div>
              </div>

              {/* Grid de stats */}
              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="glass-card p-4 rounded-3 h-100 border-start border-info border-4">
                      <span className="text-info font-monospace small d-block mb-2">// Jugadores Online</span>
                      <div className="fs-1 fw-bold text-white">1,402</div>
                      <div className="progress mt-3" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="progress-bar bg-info" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="glass-card p-4 rounded-3 h-100 d-flex flex-column justify-content-between">
                      <span className="material-symbols-outlined text-info fs-1 mb-3">account_balance</span>
                      <div>
                        <div className="fs-2 fw-bold text-white">$4.2M</div>
                        <span className="text-secondary small text-uppercase" style={{ letterSpacing: '0.1em' }}>Circulacion Total</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="glass-card p-4 rounded-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-25 rounded-3 d-flex align-items-center justify-content-center text-info" style={{ width: '56px', height: '56px' }}>
                          <span className="material-symbols-outlined fs-2">verified_user</span>
                        </div>
                        <div>
                          <h4 className="fw-bold text-white mb-1">Facciones Oficiales</h4>
                          <p className="mb-0 text-secondary small">LSPD, EMS y 12 organizaciones activas</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-info fs-2">chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seccion de caracteristicas */}
        <section className="py-5 my-5">
          <div className="container">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3">
              <div>
                <h2 className="text-info font-monospace small text-uppercase mb-2" style={{ letterSpacing: '0.2em' }}>SISTEMA</h2>
                <h3 className="display-5 fw-bold mb-0 text-white">INFRAESTRUCTURA</h3>
              </div>
              <p className="text-secondary mb-0" style={{ maxWidth: '400px' }}>
                Disenado para ofrecer una experiencia sin interrupciones con latencia minima y herramientas de gestion en tiempo real.
              </p>
            </div>

            <div className="row g-4">
              {[
                {
                  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1S1hqTVDHhklDIxCuKDOTN0Sgv15NXRQOK16tSh8k2eo1iXuDg7AJKN2TmpayVMBVKXt9I47CLqX4wdGW2pgvlznc4jYs6gnoHtSMt3UG8HHQXleAcotfGURHVQOYEGGpo36N1LQQrxbPZHPW4_D8vQB9NPXlORBQGbjND6Kjo6lj1wQ0BLgXcELQRd6MZyr6WgXxb4htc5NKO_0wrn2aRbqUSwpKYdDYy5_jkVjx-jS49AeJENWWIxiM9OlTztSh__47zKSYELaL',
                  icon: 'payments', title: 'Economia Dinamica',
                  desc: 'Sistema de mercado libre con inflacion controlada y multiples vias de generacion de ingresos legales e ilegales.',
                },
                {
                  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6bUfW8mopsJg21aIOnBnrlWOJbl4TADPAYgS5WlcNdIcUKFyLSvcgrnuzjOqwWbRmZjMIInNz9H9tEwRll3wXuJ3YB3iWQmPMZJkp8qWCMDtDQidTg9IyoDJPUyhDfsUPxhRLCtriIgYpiehDw4xRmS97Ndw0CM-k2txAZbEbQsmwnwZzibYpv68NPYpwv5GdaYgfWws2lqeG7PFG7rGFmQJL-4UjwhZxMoD6HsDMZLaCnPuubgld65IOc1o_KrQC76JllITjUNKe',
                  icon: 'map', title: 'Propiedades Inteligentes',
                  desc: 'Adquiere casas, almacenes y negocios. Personaliza interiores y gestiona accesos mediante el sistema biometrico digital.',
                },
                {
                  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVTaX1DjIU3rvjJUBlDnjIhMiR1J5WOi4kNYISSVeDqAgH9lxEl5iRmvycPMLAsogS-SMdAtwT_aE4GbK8T8PC7wXYosmBJtL-heINkSWCQ5nkNof5IICz9MGBUx2UQEfW4Zc74KHIt7N5CjjQd7_pQmu2WpFrifOBOJ71n-YzWlzvm0P12NcnvpaMyvU5LhCU9cQRtUTH-6GqUJmbdRM7TvpbCNnCtDCpJYd6GHqI0KtDbhdQSWYaTMboZFkG9ZUocNxp4HbrQNE',
                  icon: 'shield', title: 'Seguridad de Datos',
                  desc: 'Encriptacion de fin a fin para tus transacciones y datos de personaje. Tu progreso esta siempre a salvo en la red.',
                },
              ].map((f) => (
                <div key={f.title} className="col-md-4">
                  <div className="position-relative mb-4 overflow-hidden rounded-4 shadow" style={{ aspectRatio: '16/9' }}>
                    <img className="w-100 h-100 object-fit-cover transition-transform" style={{ transition: 'transform 0.5s' }} src={f.src} alt={f.title} />
                    <div className="position-absolute bottom-0 start-0 p-3 bg-info text-dark rounded-top-end-3" style={{ borderTopRightRadius: '0.5rem' }}>
                      <span className="material-symbols-outlined fs-3">{f.icon}</span>
                    </div>
                  </div>
                  <h4 className="fw-bold text-white mb-2">{f.title}</h4>
                  <p className="text-secondary">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seccion CTA (call to action) */}
        <section className="py-5 my-5">
          <div className="container">
            <div className="position-relative p-5 rounded-4 text-center border border-secondary shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b2025, #252a30)' }}>
              <div className="position-relative z-1">
                <h2 className="display-5 fw-bold mb-4 text-white">LISTO PARA EL ACCESO?</h2>
                <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: '700px' }}>
                  Unete a miles de ciudadanos en la metropolis digital mas avanzada. Elige tu camino y forja tu propia leyenda en el ecosistema Azure.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  <button className="btn btn-info btn-lg fw-bold px-5 text-dark shadow">
                    CREAR PERSONAJE
                  </button>
                  <button className="btn btn-outline-light btn-lg fw-bold px-5">
                    VER NORMATIVA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de pagina */}
      <footer className="py-5 border-top border-secondary text-secondary mt-5" style={{ backgroundColor: '#0a0f14' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-4 text-center text-md-start">
              <div className="fs-5 fw-bold text-white mb-2">UCP SUITE</div>
              <p className="small mb-0">© 2026 lamajadesnuda. No afiliado con Rockstar Games o Take-Two Interactive. TFG Project.</p>
            </div>
            <div className="col-md-4">
              <ul className="list-inline text-center mb-0">
                <li className="list-inline-item mx-2"><a className="text-decoration-none text-secondary" href="#">Discord</a></li>
                <li className="list-inline-item mx-2"><a className="text-decoration-none text-secondary" href="#">Reglas</a></li>
                <li className="list-inline-item mx-2"><a className="text-decoration-none text-secondary" href="#">Terminos Legales</a></li>
                <li className="list-inline-item mx-2"><a className="text-decoration-none text-secondary" href="#">Soporte</a></li>
              </ul>
            </div>
            <div className="col-md-4 text-center text-md-end">
              <button className="btn btn-outline-secondary btn-sm me-2">
                <span className="material-symbols-outlined small">share</span>
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <span className="material-symbols-outlined small">language</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
