// Dashboard del jugador normal
// Muestra los personajes del usuario, su dinero, inventario y vehiculos
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { getUserRole } from '../auth/authUtils';

// Funcion auxiliar: saca el hash de la licencia desde el token JWT
// El token tiene un "sub" que es algo como "char1:abc123" -> devuelve "abc123"
const getLicenseHashFromToken = (token) => {
  try {
    // Decodifico la parte de en medio del JWT (payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const sub = payload.sub || '';

    // Busco los dos puntos para separar el prefijo
    const colonIdx = sub.indexOf(':');
    if (colonIdx !== -1) {
      return sub.slice(colonIdx + 1);
    } else {
      return sub;
    }
  } catch (e) {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de los personajes del usuario
  const [chars, setChars] = useState([]);
  const [selectedIdentifier, setSelectedIdentifier] = useState(null);

  // Datos del personaje seleccionado
  const [playerData, setPlayerData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Cuando se carga la pagina: busco los personajes del usuario
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('jwt');
      const hash = token ? getLicenseHashFromToken(token) : null;

      // Si no hay hash, vuelvo a la portada
      if (!hash) {
        navigate('/');
        return;
      }

      // Preparo la cabecera con el token
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // Pido los personajes del usuario al backend
        const res = await axios.get(`/player-service/players/chars/${hash}`, config);
        const list = Array.isArray(res.data) ? res.data : [];
        setChars(list);

        // Si tiene al menos un personaje, selecciono el primero
        if (list.length > 0) {
          setSelectedIdentifier(list[0].identifier);
        } else {
          setLoading(false);
        }
      } catch (err) {
        // Si el token no vale, lo borro y vuelvo a la portada
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

  // Funcion que carga todos los datos de un personaje en paralelo
  const fetchCharData = useCallback(async (identifier) => {
    const token = localStorage.getItem('jwt');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    setLoading(true);
    try {
      // Hago las 3 peticiones a la vez para que sea mas rapido
      const [playerRes, vehiclesRes, inventoryRes] = await Promise.all([
        axios.get(`/player-service/players/${identifier}`, config).catch(() => ({ data: null })),
        axios.get(`/player-service/players/${identifier}/vehicles`, config).catch(() => ({ data: [] })),
        axios.get(`/player-service/players/${identifier}/inventory`, config).catch(() => ({ data: [] })),
      ]);

      setPlayerData(playerRes.data);
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
    } catch (e) {
      setError('Error al cargar los datos del personaje.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cada vez que cambia el personaje seleccionado, recargo sus datos
  useEffect(() => {
    if (selectedIdentifier) {
      fetchCharData(selectedIdentifier);
    }
  }, [selectedIdentifier, fetchCharData]);

  // Cierra sesion: borra el token y va al inicio
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  // Mientras carga, muestro un spinner
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#0a0f14' }}>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Compruebo si el usuario es admin para mostrar el boton del panel
  const isAdmin = ['admin', 'superadmin'].includes(getUserRole());

  // Calculo el nombre del jugador
  let pName = 'Usuario Desconocido';
  if (playerData) {
    const partes = [playerData.firstname, playerData.lastname].filter(Boolean);
    if (partes.length > 0) {
      pName = partes.join(' ');
    }
  }

  // Trabajo y grupo del jugador (con valores por defecto)
  const pJob = playerData?.job || 'Desempleado';
  const pGroup = playerData?.group || 'user';

  // Parseo el JSON de las cuentas
  let accounts = {};
  try {
    accounts = JSON.parse(playerData?.accounts || '{}');
  } catch (e) {
    // Si falla el parse, dejo el objeto vacio
  }
  const pMoney = accounts.money || 0;
  const pBank = accounts.bank || 0;
  const pBlackMoney = accounts.black_money || 0;

  // Devuelve los estilos del badge segun el grupo
  const groupBadgeStyle = () => {
    if (pGroup === 'superadmin') {
      return { backgroundColor: 'rgba(255,180,171,0.15)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)' };
    }
    if (pGroup === 'admin') {
      return { backgroundColor: 'rgba(3,86,255,0.15)', color: '#4cd6ff', border: '1px solid rgba(0,209,255,0.3)' };
    }
    return { backgroundColor: 'rgba(0,209,255,0.08)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' };
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#0a0f14', color: '#dee3ea', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Barra superior */}
      <header className="sticky-top shadow-sm site-header">
        <div className="container-fluid px-4 py-3 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="fs-4 fw-bold text-uppercase" style={{ color: '#4cd6ff', letterSpacing: '0.1em' }}>CyberUCP</div>
            <nav className="d-none d-md-flex align-items-center gap-4">
              <a className="nav-link-active" href="#">Economia</a>
              <a className="nav-link-custom" href="#">Propiedades</a>
              <a className="nav-link-custom" href="#">Facciones</a>
              <a className="nav-link-custom" href="#">Tienda</a>
            </nav>
            <div className="d-flex align-items-center gap-3">
              {/* Si tiene mas de un personaje muestro el selector */}
              {chars.length > 1 && (
                <select
                  className="form-select form-select-sm"
                  style={{ backgroundColor: '#1b2025', color: '#dee3ea', border: '1px solid rgba(0,209,255,0.2)', width: 'auto' }}
                  value={selectedIdentifier}
                  onChange={e => setSelectedIdentifier(e.target.value)}
                >
                  {chars.map((c, i) => {
                    const partes = [c.firstname, c.lastname].filter(Boolean);
                    const n = partes.length > 0 ? partes.join(' ') : `Personaje ${i + 1}`;
                    return <option key={c.identifier} value={c.identifier}>{n}</option>;
                  })}
                </select>
              )}
              <span className="small fw-medium text-secondary d-none d-sm-inline">
                Bienvenido, <span className="text-white">{pName}</span>
              </span>
              {/* Boton para ir al panel admin (solo si es admin) */}
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
        {/* Mensaje de error si lo hay */}
        {error && <div className="alert alert-danger mb-4" role="alert">{error}</div>}

        {/* Lista de personajes en botones (si tiene varios) */}
        {chars.length > 1 && (
          <div className="mb-4">
            <p className="text-secondary small text-uppercase mb-2" style={{ letterSpacing: '0.1em' }}>Tus personajes</p>
            <div className="d-flex flex-wrap gap-2">
              {chars.map((c, i) => {
                const partes = [c.firstname, c.lastname].filter(Boolean);
                const n = partes.length > 0 ? partes.join(' ') : `Personaje ${i + 1}`;
                const isActive = c.identifier === selectedIdentifier;

                // Estilos del boton segun si esta activo
                let estiloBoton;
                if (isActive) {
                  estiloBoton = { background: 'linear-gradient(to right,#0356ff,#00d1ff)', color: 'white', border: 'none' };
                } else {
                  estiloBoton = { background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' };
                }

                return (
                  <button
                    key={c.identifier}
                    onClick={() => setSelectedIdentifier(c.identifier)}
                    className="btn btn-sm fw-bold"
                    style={estiloBoton}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="row g-5 align-items-start">

          {/* Tarjeta de identidad */}
          <section className="col-lg-4">
            <div className="glass-card p-5 d-flex flex-column align-items-center text-center position-relative h-100 overflow-hidden">
              <div className="position-absolute top-0 end-0 p-3 opacity-25">
                <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '4rem' }}>badge</span>
              </div>
              <div className="rounded-circle overflow-hidden mb-4 avatar-ring" style={{ width: '128px', height: '128px', marginTop: '1rem', background: '#1b2025', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '4rem' }}>person</span>
              </div>
              <h1 className="fs-3 fw-bold text-white mb-1" style={{ letterSpacing: '-0.025em' }}>{pName}</h1>
              <p className="fw-medium text-uppercase small mb-2" style={{ color: '#00d1ff', letterSpacing: '0.1em' }}>{pJob}</p>
              <span className="badge mb-4 text-uppercase" style={{ ...groupBadgeStyle(), fontSize: '0.65rem', letterSpacing: '0.1em' }}>{pGroup}</span>

              <div className="w-100 pt-4 border-top border-white-5 mt-auto">
                <div className="d-flex justify-content-between align-items-center small mb-3">
                  <span className="text-secondary text-uppercase" style={{ letterSpacing: '-0.05em' }}>Fecha Nacimiento</span>
                  <span className="text-white font-monospace">{playerData?.dateofbirth || 'Desconocida'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-secondary text-uppercase" style={{ letterSpacing: '-0.05em' }}>Genero</span>
                  <span className="text-white">{playerData?.sex === 'f' ? 'Femenino' : 'Masculino'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Datos financieros y secundarios */}
          <section className="col-lg-8">
            <div className="d-flex flex-column gap-4">

              {/* Grid de finanzas */}
              <div className="row g-4">
                {/* Efectivo */}
                <div className="col-md-4">
                  <div className="glass-card p-4 position-relative overflow-hidden h-100">
                    <div className="position-absolute bottom-0 end-0 p-2 text-primary-custom" style={{ transform: 'translate(10px,10px)', opacity: 0.05 }}>
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
                {/* Banco */}
                <div className="col-md-4">
                  <div className="glass-card p-4 position-relative overflow-hidden h-100">
                    <div className="position-absolute bottom-0 end-0 p-2 text-white" style={{ transform: 'translate(10px,10px)', opacity: 0.05 }}>
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
                {/* Dinero sucio */}
                <div className="col-md-4">
                  <div className="glass-card p-4 position-relative overflow-hidden h-100" style={{ borderColor: 'rgba(255,180,171,0.2)' }}>
                    <div className="position-absolute bottom-0 end-0 p-2 text-error-custom" style={{ transform: 'translate(10px,10px)', opacity: 0.05 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '5rem' }}>skull</span>
                    </div>
                    <p className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.1em' }}>Dinero Sucio</p>
                    <h3 className="fs-2 font-monospace fw-bold mb-0 text-error-custom" style={{ letterSpacing: '-0.05em' }}>${pBlackMoney.toLocaleString()}</h3>
                    <div className="mt-3 d-flex align-items-center gap-2 small text-error-custom" style={{ opacity: 0.8 }}>
                      <span className="material-symbols-outlined fs-6">warning</span>
                      <span>Riesgo de incautacion</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garaje e inventario */}
              <div className="row g-4 mt-2">
                {/* Garaje */}
                <div className="col-md-7">
                  <div className="glass-card h-100 p-0 overflow-hidden d-flex flex-column">
                    <div className="px-4 py-3 bg-surface-container d-flex justify-content-between align-items-center border-bottom border-white-5">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary-custom">directions_car</span>
                        <h4 className="m-0 fs-6 fw-bold text-uppercase" style={{ letterSpacing: '-0.025em' }}>Garaje Personal</h4>
                      </div>
                      <span className="badge border border-info text-primary-custom" style={{ backgroundColor: 'rgba(0,209,255,0.1)', fontSize: '10px' }}>{vehicles.length} VEHICULOS</span>
                    </div>
                    <div className="table-responsive custom-scrollbar flex-grow-1 mb-0" style={{ maxHeight: '260px' }}>
                      <table className="table table-borderless table-hover mb-0 text-white small align-middle">
                        <thead className="bg-surface-container-low text-secondary text-uppercase border-bottom border-white-5" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                          <tr>
                            <th className="px-4 py-2 fw-bold">Matricula</th>
                            <th className="px-4 py-2 fw-bold">Modelo</th>
                            <th className="px-4 py-2 fw-bold text-end">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.length > 0 ? vehicles.map((v, idx) => (
                            <tr key={idx} className="hover-bg-white-5 border-bottom border-white-5">
                              <td className="px-4 py-3 font-monospace text-primary-custom">{v.plate}</td>
                              <td className="px-4 py-3">{v.model || v.hash}</td>
                              <td className="px-4 py-3 text-end">
                                {v.stored
                                  ? <span className="badge rounded-pill vehicle-status-stored fw-bold" style={{ fontSize: '10px' }}>GARAJE</span>
                                  : <span className="badge rounded-pill vehicle-status-out fw-bold" style={{ fontSize: '10px' }}>FUERA</span>
                                }
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan="3" className="px-4 py-3 text-center text-secondary">No hay vehiculos registrados</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Inventario */}
                <div className="col-md-5">
                  <div className="glass-card h-100 p-0 overflow-hidden d-flex flex-column">
                    <div className="px-4 py-3 bg-surface-container d-flex justify-content-between align-items-center border-bottom border-white-5">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary-custom">inventory_2</span>
                        <h4 className="m-0 fs-6 fw-bold text-uppercase" style={{ letterSpacing: '-0.025em' }}>Mochila</h4>
                      </div>
                      <span className="small text-secondary" style={{ fontSize: '10px' }}>{inventory.length} ITEMS</span>
                    </div>
                    <div className="p-3 custom-scrollbar overflow-auto flex-grow-1" style={{ maxHeight: '260px' }}>
                      <div className="d-flex flex-column gap-2">
                        {inventory.length > 0 ? inventory.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center justify-content-between p-2 bg-surface-container-low rounded border border-white-5">
                            <div className="d-flex align-items-center gap-3">
                              <div className="d-flex align-items-center justify-content-center rounded border border-white-5" style={{ width: '36px', height: '36px', backgroundColor: '#0f1419', flexShrink: 0 }}>
                                <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '1.1rem' }}>category</span>
                              </div>
                              <span className="fw-medium small text-white">{item.label || item.name}</span>
                            </div>
                            <span className="badge text-dark bg-info rounded px-2 py-1 fw-bold" style={{ flexShrink: 0 }}>x{item.count}</span>
                          </div>
                        )) : (
                          <div className="text-center text-secondary py-3">La mochila esta vacia</div>
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

      {/* Pie de pagina */}
      <footer className="w-100 border-top mt-5 py-5" style={{ backgroundColor: '#0a0f14', borderColor: 'rgba(0,209,255,0.1)' }}>
        <div className="container-fluid px-4 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="row g-4 align-items-center">
            <div className="col-md-6 d-flex flex-column gap-2 text-center text-md-start">
              <span className="fs-5 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.1em' }}>CyberUCP</span>
              <p className="small text-secondary mb-0">© 2024 CyberUCP. No afiliado con Rockstar Games o Take-Two Interactive. TFG Project.</p>
            </div>
            <div className="col-md-6 d-flex flex-wrap justify-content-center justify-content-md-end gap-4">
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Discord</a>
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Reglas</a>
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Terminos Legales</a>
              <a className="text-secondary text-decoration-none nav-link-custom small" href="#">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
