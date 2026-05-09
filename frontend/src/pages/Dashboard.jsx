import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserRole } from '../auth/authUtils';

const getLicenseHashFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const sub = payload.sub || '';
    // sub es "charN:HASH" — extraemos el hash (todo después del primer ":")
    const colonIdx = sub.indexOf(':');
    return colonIdx !== -1 ? sub.slice(colonIdx + 1) : sub;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chars, setChars] = useState([]);
  const [selectedIdentifier, setSelectedIdentifier] = useState(null);

  const [playerData, setPlayerData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Carga inicial: obtiene todos los personajes del jugador
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('jwt');
      const hash = token ? getLicenseHashFromToken(token) : null;
      if (!hash) { navigate('/'); return; }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const res = await axios.get(`/player-service/players/chars/${hash}`, config);
        const list = Array.isArray(res.data) ? res.data : [];
        setChars(list);
        if (list.length > 0) setSelectedIdentifier(list[0].identifier);
        else setLoading(false);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('jwt');
          navigate('/');
        } else {
          setError('Error al cargar los personajes.');
          setLoading(false);
        }
      }
    };
    init();
  }, [navigate]);

  // Cada vez que cambia el personaje seleccionado, carga sus datos
  const fetchCharData = useCallback(async (identifier) => {
    const token = localStorage.getItem('jwt');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    setLoading(true);
    try {
      const [playerRes, vehiclesRes, inventoryRes] = await Promise.all([
        axios.get(`/player-service/players/${identifier}`, config).catch(() => ({ data: null })),
        axios.get(`/player-service/players/${identifier}/vehicles`, config).catch(() => ({ data: [] })),
        axios.get(`/player-service/players/${identifier}/inventory`, config).catch(() => ({ data: [] })),
      ]);
      setPlayerData(playerRes.data);
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
    } catch (err) {
      setError('Error al cargar los datos del personaje.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedIdentifier) fetchCharData(selectedIdentifier);
  }, [selectedIdentifier, fetchCharData]);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#0a0f14' }}>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const isAdmin = ['admin', 'superadmin'].includes(getUserRole());

  const pName = playerData
    ? [playerData.firstname, playerData.lastname].filter(Boolean).join(' ') || 'Usuario Desconocido'
    : 'Usuario Desconocido';
  const pJob = playerData?.job || 'Desempleado';

  let accounts = {};
  try { accounts = JSON.parse(playerData?.accounts || '{}'); } catch {}
  const pMoney = accounts.money || 0;
  const pBank = accounts.bank || 0;
  const pBlackMoney = accounts.black_money || 0;

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#0a0f14', color: '#dee3ea', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>
        {`
          .glass-card {
            background: rgba(15, 20, 25, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 209, 255, 0.15);
            border-radius: 0.75rem;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #00d1ff33; border-radius: 10px; }
          .nav-link-custom { color: #94a3b8; transition: color 0.3s; text-decoration: none; }
          .nav-link-custom:hover { color: white; }
          .nav-link-active { color: #4cd6ff; border-bottom: 2px solid #4cd6ff; padding-bottom: 4px; text-decoration: none; }
          .btn-logout { border: 1px solid #ffb4ab; color: #ffb4ab; background: transparent; transition: all 0.3s; }
          .btn-logout:hover { background: rgba(255, 180, 171, 0.1); color: #ffb4ab; }
          .avatar-ring { box-shadow: 0 0 0 4px #0a0f14, 0 0 0 8px #00d1ff; }
          .bg-surface-container { background-color: #1b2025; }
          .bg-surface-container-low { background-color: #171c21; }
          .text-primary-custom { color: #00d1ff; }
          .text-error-custom { color: #ffb4ab; }
          .border-white-5 { border-color: rgba(255,255,255,0.05) !important; }
          .hover-bg-white-5:hover { background-color: rgba(255,255,255,0.05); }
          .table > :not(caption) > * > * { background-color: transparent !important; color: inherit !important; }
        `}
      </style>

      {/* TopNavBar */}
      <header className="sticky-top shadow-sm" style={{ background: 'rgba(15, 20, 25, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,209,255,0.15)' }}>
        <div className="container-fluid px-4 py-3 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="fs-4 fw-bold text-uppercase" style={{ color: '#4cd6ff', letterSpacing: '0.1em' }}>
              CyberUCP
            </div>
            <nav className="d-none d-md-flex align-items-center gap-4">
              <a className="nav-link-active" href="#">Economía</a>
              <a className="nav-link-custom" href="#">Propiedades</a>
              <a className="nav-link-custom" href="#">Facciones</a>
              <a className="nav-link-custom" href="#">Tienda</a>
            </nav>
            <div className="d-flex align-items-center gap-3">
              {chars.length > 1 && (
                <select
                  className="form-select form-select-sm"
                  style={{ backgroundColor: '#1b2025', color: '#dee3ea', border: '1px solid rgba(0,209,255,0.2)', width: 'auto' }}
                  value={selectedIdentifier}
                  onChange={e => setSelectedIdentifier(e.target.value)}
                >
                  {chars.map((c, i) => {
                    const n = [c.firstname, c.lastname].filter(Boolean).join(' ') || `Personaje ${i + 1}`;
                    return <option key={c.identifier} value={c.identifier}>{n}</option>;
                  })}
                </select>
              )}
              <span className="small fw-medium text-secondary d-none d-sm-inline">
                Bienvenido, <span className="text-white">{pName}</span>
              </span>
              {isAdmin && (
                <button onClick={() => navigate('/admin-dashboard')} className="btn btn-sm px-4 py-2 fw-bold text-uppercase" style={{ background: 'linear-gradient(to right, #0356ff, #00d1ff)', color: 'white', border: 'none', letterSpacing: '0.05em' }}>
                  Admin Panel
                </button>
              )}
              <button onClick={handleLogout} className="btn btn-logout btn-sm px-4 py-2 fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid px-4 py-5 mx-auto" style={{ maxWidth: '1536px' }}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row g-5 align-items-start">
          
          {/* Identity Card */}
          <section className="col-lg-4">
            <div className="glass-card p-5 d-flex flex-column align-items-center text-center position-relative h-100 overflow-hidden">
              <div className="position-absolute top-0 end-0 p-3 opacity-25">
                <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '4rem' }}>badge</span>
              </div>
              <div className="rounded-circle overflow-hidden mb-4 avatar-ring" style={{ width: '128px', height: '128px', marginTop: '1rem' }}>
                <img 
                  className="w-100 h-100 object-fit-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA4eVILRRtEmDVt50BwCk5AOla-wYxvyE7DtyBEToR1ZFWg3nKrefWKiUBSq_SJVKSeQ2lHc3TpbeEwUL03Mdy9gmY-bxcXWj1PiPTD87Fb11ykKQCEXv22Jzm0uaECSlMf6NS8Uqch0B_IFwgK7r1EpqSlKL8Cq8MjqMAWxREoHvG3m_fmGKeoDRqp7KTaDi-OYJsX4Dx_zM1WqnFFNQ0y5BQmFwiibQy2l1Dv2A6shMniN-M89WVbJwYMxHRmalNZG0BjyzEPbzO"
                  alt="Avatar"
                />
              </div>
              <h1 className="fs-3 fw-bold text-white mb-1" style={{ letterSpacing: '-0.025em' }}>{pName}</h1>
              <p className="fw-medium text-uppercase small mb-4" style={{ color: '#00d1ff', letterSpacing: '0.1em' }}>{pJob}</p>
              
              <div className="w-100 pt-4 border-top border-white-5 mt-auto">
                <div className="d-flex justify-content-between align-items-center small mb-3">
                  <span className="text-secondary text-uppercase" style={{ letterSpacing: '-0.05em' }}>Fecha Nacimiento</span>
                  <span className="text-white font-monospace">{playerData?.dateofbirth || 'Desconocida'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-secondary text-uppercase" style={{ letterSpacing: '-0.05em' }}>Género</span>
                  <span className="text-white">{playerData?.sex === 'f' ? 'Femenino' : 'Masculino'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Finance & Secondary Data */}
          <section className="col-lg-8">
            <div className="d-flex flex-column gap-4">
              
              {/* Finance Grid */}
              <div className="row g-4">
                {/* Cash */}
                <div className="col-md-4">
                  <div className="glass-card p-4 position-relative overflow-hidden h-100">
                    <div className="position-absolute bottom-0 end-0 p-2 text-primary-custom" style={{ transform: 'translate(10px, 10px)', opacity: 0.05 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '5rem' }}>payments</span>
                    </div>
                    <p className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.1em' }}>Efectivo</p>
                    <h3 className="fs-2 font-monospace fw-bold mb-0 text-primary-custom" style={{ letterSpacing: '-0.05em' }}>${pMoney.toLocaleString()}</h3>
                    <div className="mt-3 d-flex align-items-center gap-2 small text-primary-custom" style={{ opacity: 0.8 }}>
                      <span className="material-symbols-outlined fs-6">trending_up</span>
                      <span>Sincronizado</span>
                    </div>
                  </div>
                </div>
                {/* Bank */}
                <div className="col-md-4">
                  <div className="glass-card p-4 position-relative overflow-hidden h-100">
                    <div className="position-absolute bottom-0 end-0 p-2 text-white" style={{ transform: 'translate(10px, 10px)', opacity: 0.05 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '5rem' }}>account_balance</span>
                    </div>
                    <p className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.1em' }}>Banco</p>
                    <h3 className="fs-2 font-monospace fw-bold mb-0 text-white" style={{ letterSpacing: '-0.05em' }}>${pBank.toLocaleString()}</h3>
                    <div className="mt-3 d-flex align-items-center gap-2 small text-secondary">
                      <span className="material-symbols-outlined fs-6">lock</span>
                      <span>Maze Bank Secure</span>
                    </div>
                  </div>
                </div>
                {/* Black Money */}
                <div className="col-md-4">
                  <div className="glass-card p-4 position-relative overflow-hidden h-100" style={{ borderColor: 'rgba(255, 180, 171, 0.2)' }}>
                    <div className="position-absolute bottom-0 end-0 p-2 text-error-custom" style={{ transform: 'translate(10px, 10px)', opacity: 0.05 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '5rem' }}>skull</span>
                    </div>
                    <p className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.1em' }}>Dinero Sucio</p>
                    <h3 className="fs-2 font-monospace fw-bold mb-0 text-error-custom" style={{ letterSpacing: '-0.05em' }}>${pBlackMoney.toLocaleString()}</h3>
                    <div className="mt-3 d-flex align-items-center gap-2 small text-error-custom" style={{ opacity: 0.8 }}>
                      <span className="material-symbols-outlined fs-6">warning</span>
                      <span>Riesgo de incautación</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Data Row */}
              <div className="row g-4 mt-2">
                {/* Garage Card */}
                <div className="col-md-7">
                  <div className="glass-card h-100 p-0 overflow-hidden d-flex flex-column">
                    <div className="px-4 py-3 bg-surface-container d-flex justify-content-between align-items-center border-bottom border-white-5">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary-custom">directions_car</span>
                        <h4 className="m-0 fs-6 fw-bold text-uppercase" style={{ letterSpacing: '-0.025em' }}>Garaje Personal</h4>
                      </div>
                      <span className="badge border border-info text-primary-custom" style={{ backgroundColor: 'rgba(0, 209, 255, 0.1)', fontSize: '10px' }}>{vehicles.length} VEHÍCULOS</span>
                    </div>
                    <div className="table-responsive custom-scrollbar flex-grow-1 mb-0">
                      <table className="table table-borderless table-hover mb-0 text-white small align-middle">
                        <thead className="bg-surface-container-low text-secondary text-uppercase border-bottom border-white-5" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                          <tr>
                            <th className="px-4 py-2 fw-bold">Matrícula</th>
                            <th className="px-4 py-2 fw-bold">Modelo</th>
                            <th className="px-4 py-2 fw-bold text-end">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="border-top-0">
                          {vehicles.length > 0 ? (
                            vehicles.map((v, idx) => (
                              <tr key={idx} className="hover-bg-white-5 border-bottom border-white-5 transition-colors">
                                <td className="px-4 py-3 font-monospace text-primary-custom">{v.plate}</td>
                                <td className="px-4 py-3">{v.model || v.hash}</td>
                                <td className="px-4 py-3 text-end">
                                  {v.stored ? (
                                    <span className="badge rounded-pill text-primary-custom fw-bold" style={{ backgroundColor: 'rgba(0, 209, 255, 0.2)', fontSize: '10px' }}>GARAJE</span>
                                  ) : (
                                    <span className="badge rounded-pill fw-bold" style={{ color: '#0356ff', backgroundColor: 'rgba(3, 86, 255, 0.2)', fontSize: '10px' }}>FUERA</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-center text-secondary">No hay vehículos</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Inventory Card */}
                <div className="col-md-5">
                  <div className="glass-card h-100 p-0 overflow-hidden d-flex flex-column">
                    <div className="px-4 py-3 bg-surface-container d-flex justify-content-between align-items-center border-bottom border-white-5">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary-custom">inventory_2</span>
                        <h4 className="m-0 fs-6 fw-bold text-uppercase" style={{ letterSpacing: '-0.025em' }}>Inventario Rápido</h4>
                      </div>
                      <span className="small text-secondary" style={{ fontSize: '10px' }}>{inventory.length} ITEMS</span>
                    </div>
                    <div className="p-4 custom-scrollbar overflow-auto flex-grow-1" style={{ maxHeight: '250px' }}>
                      <div className="d-flex flex-column gap-3">
                        {inventory.length > 0 ? (
                          inventory.map((item, idx) => (
                            <div key={idx} className="d-flex align-items-center justify-content-between p-2 bg-surface-container-low rounded border border-white-5">
                              <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded border border-white-5" style={{ width: '40px', height: '40px', backgroundColor: '#0f1419' }}>
                                  <span className="material-symbols-outlined text-primary-custom">category</span>
                                </div>
                                <span className="fw-medium small text-white">{item.label || item.name}</span>
                              </div>
                              <span className="badge text-dark bg-info rounded px-2 py-1 fw-bold">{item.count}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-secondary py-3">El inventario está vacío</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-100 border-top mt-5 py-5" style={{ backgroundColor: '#0a0f14', borderColor: 'rgba(0, 209, 255, 0.1)' }}>
        <div className="container-fluid px-4 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="row g-4 align-items-center">
            <div className="col-md-6 d-flex flex-column gap-2 text-center text-md-start">
              <span className="fs-5 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.1em' }}>CyberUCP</span>
              <p className="small text-secondary mb-0">© 2024 CyberUCP. No afiliado con Rockstar Games o Take-Two Interactive. TFG Project.</p>
            </div>
            <div className="col-md-6 d-flex flex-wrap justify-content-center justify-content-md-end gap-4">
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Discord</a>
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Reglas</a>
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Términos Legales</a>
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Soporte</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
