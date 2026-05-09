import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState({ online: 0, max: 1024 });
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Economy states
  const [cash, setCash] = useState(0);
  const [bank, setBank] = useState(0);
  const [vault, setVault] = useState(0); // Using vault for black_money

  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [banDuration, setBanDuration] = useState('permanent');
  const [kickReason, setKickReason] = useState('');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('jwt');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      try {
        const [playersRes, statusRes] = await Promise.all([
          axios.get('/player-service/players', config).catch(e => ({ data: [] })),
          axios.get('/mgmt-service/server/status', config).catch(e => ({ data: { online: 0, max: 1024 } }))
        ]);
        setPlayers(Array.isArray(playersRes.data) ? playersRes.data : []);
        setServerStatus(statusRes.data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('jwt');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedPlayer) {
      let acc = {};
      try { acc = JSON.parse(selectedPlayer.accounts || '{}'); } catch {}
      setCash(acc.money || 0);
      setBank(acc.bank || 0);
      setVault(acc.black_money || 0);
    }
  }, [selectedPlayer]);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  const handleSaveEconomy = async () => {
    if (!selectedPlayer) return;
    try {
      const token = localStorage.getItem('jwt');
      await axios.put(`/player-service/players/${selectedPlayer.identifier}/economy`, {
        money: Number(cash),
        bank: Number(bank),
        black_money: Number(vault)
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      showAlert('Economía actualizada correctamente', 'success');
      
      // Update local state
      const updatedPlayer = { 
        ...selectedPlayer, 
        accounts: { money: cash, bank: bank, black_money: vault } 
      };
      setSelectedPlayer(updatedPlayer);
      setPlayers(players.map(p => p.identifier === selectedPlayer.identifier ? updatedPlayer : p));
    } catch (err) {
      showAlert('Error al actualizar economía', 'danger');
    }
  };

  // identifier es "charN:HASH" — txAdmin necesita solo el hash
  const getLicenseHash = (identifier) => {
    const colonIdx = identifier?.indexOf(':');
    return colonIdx !== -1 ? identifier.slice(colonIdx + 1) : identifier;
  };

  const handleKick = async () => {
    if (!selectedPlayer) return;
    try {
      const token = localStorage.getItem('jwt');
      await axios.post('/mgmt-service/players/kick', {
        license: getLicenseHash(selectedPlayer.identifier),
        reason: kickReason.trim() || 'Expulsado desde UCP'
      }, { headers: { Authorization: `Bearer ${token}` } });
      showAlert('Jugador expulsado correctamente', 'success');
    } catch (err) {
      showAlert('Error al expulsar al jugador', 'danger');
    }
  };

  const handleBan = async () => {
    if (!selectedPlayer) return;
    try {
      const token = localStorage.getItem('jwt');
      await axios.post('/mgmt-service/players/ban', {
        license: getLicenseHash(selectedPlayer.identifier),
        reason: banReason.trim() || 'Baneado desde UCP',
        duration: banDuration
      }, { headers: { Authorization: `Bearer ${token}` } });
      showAlert('Jugador baneado correctamente', 'success');
    } catch (err) {
      showAlert('Error al banear al jugador', 'danger');
    }
  };

  const filteredPlayers = players.filter(p => {
    const fullName = [p.firstname, p.lastname].filter(Boolean).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || p.identifier?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#0a0f14' }}>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#0a0f14', color: '#dee3ea', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>
        {`
          .glass-panel {
            background: rgba(27, 32, 37, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(133, 147, 153, 0.1);
            border-radius: 0.75rem;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #0a0f14; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #30353b; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00d1ff; }
          
          .nav-link-custom { color: #94a3b8; transition: all 0.3s; padding: 0.5rem 0.75rem; border-radius: 0.375rem; text-decoration: none; }
          .nav-link-custom:hover { color: white; background-color: rgba(0, 209, 255, 0.1); }
          
          .btn-discord { background: linear-gradient(to right, #0356ff, #00d1ff); color: white; border: none; transition: all 0.3s; }
          .btn-discord:hover { box-shadow: 0 0 20px rgba(0, 209, 255, 0.4); color: white; }
          
          .input-custom { background-color: #0a0f14; border: none; color: #dee3ea; }
          .input-custom:focus { outline: none; box-shadow: none; background-color: #0a0f14; color: white; }
          .input-custom::placeholder { color: #3c494e; }
          
          .bg-surface-container { background-color: #1b2025; }
          .bg-surface-container-low { background-color: #171c21; }
          .bg-surface-container-highest { background-color: #30353b; }
          
          .text-primary-custom { color: #00d1ff; }
          .text-secondary-custom { color: #0356ff; }
          .text-error-custom { color: #ffb4ab; }
          .text-outline-variant { color: #3c494e; }
          .text-on-surface-variant { color: #bbc9cf; }
          
          .border-white-5 { border-color: rgba(255,255,255,0.05) !important; }
          .border-outline-variant { border-color: rgba(60, 73, 78, 0.15) !important; }
          
          .player-item { transition: background-color 0.2s, border-color 0.2s; border-left: 2px solid transparent; cursor: pointer; }
          .player-item:hover { background-color: #252a30; border-left-color: #00d1ff; }
          .player-item.active { background-color: #30353b; border-left-color: #00d1ff; }

          .toast-container-custom {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1055;
          }
        `}
      </style>

      {/* Floating Alert System */}
      {alert.show && (
        <div className="toast-container-custom">
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg`} role="alert">
            <strong>{alert.type === 'success' ? 'Éxito: ' : 'Error: '}</strong> {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
          </div>
        </div>
      )}

      {/* TopNavBar */}
      <header className="sticky-top shadow-sm" style={{ background: 'rgba(15, 20, 25, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,209,255,0.15)' }}>
        <div className="container-fluid px-4 py-3 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4 fw-bold text-uppercase" style={{ color: '#4cd6ff', letterSpacing: '0.1em' }}>
                CyberUCP
              </span>
              <span className="badge ms-2 text-uppercase fw-bold" style={{ backgroundColor: '#00d1ff', color: '#00566a', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                Admin Mode
              </span>
            </div>
            
            <nav className="d-none d-md-flex align-items-center gap-3">
              <a className="nav-link-custom small" href="#">Economía</a>
              <a className="nav-link-custom small" href="#">Propiedades</a>
              <a className="nav-link-custom small" href="#">Facciones</a>
              <a className="nav-link-custom small" href="#">Tienda</a>
            </nav>
            <div className="d-flex align-items-center gap-3">
              <button onClick={handleLogout} className="btn btn-discord btn-sm px-4 py-2 fw-bold">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow-1 w-100 pt-4 pb-5 px-3 px-md-4">
        <div className="container-fluid mx-auto p-0" style={{ maxWidth: '1536px' }}>
          <div className="row g-4" style={{ height: 'calc(100vh - 140px)', minHeight: '700px' }}>
            
            {/* Left Column: Radar */}
            <aside className="col-lg-4 col-xl-3 d-flex flex-column gap-4 h-100">
              
              {/* Server Status Glass Card */}
              <div className="glass-panel p-4 position-relative overflow-hidden group">
                <div className="d-flex align-items-center justify-content-between mb-2 position-relative" style={{ zIndex: 10 }}>
                  <h2 className="text-on-surface-variant fw-semibold text-uppercase m-0" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>Server Radar</h2>
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#00d1ff', boxShadow: '0 0 8px rgba(0,209,255,0.8)' }}></span>
                    <span className="text-primary-custom font-monospace" style={{ fontSize: '0.75rem' }}>{serverStatus.online}/{serverStatus.max}</span>
                  </div>
                </div>
                {/* Search Input */}
                <div className="position-relative mt-3" style={{ zIndex: 10 }}>
                  <span className="material-symbols-outlined position-absolute text-outline-variant" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.125rem' }}>search</span>
                  <input 
                    className="form-control input-custom py-2" 
                    style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }} 
                    placeholder="Search by ID or Name..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Scrollable Player List */}
              <div className="glass-panel flex-grow-1 d-flex flex-column overflow-hidden position-relative">
                <div className="p-3 d-flex justify-content-between align-items-center sticky-top" style={{ backgroundColor: 'rgba(27, 32, 37, 0.5)', borderBottom: '1px solid rgba(60, 73, 78, 0.15)', zIndex: 10 }}>
                  <span className="fw-bold text-on-surface-variant text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Active Links</span>
                  <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '0.875rem' }}>filter_list</span>
                </div>
                <div className="flex-grow-1 overflow-auto p-2 d-flex flex-column gap-1 custom-scrollbar">
                  
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, idx) => (
                      <div 
                        key={idx} 
                        className={`player-item d-flex align-items-center justify-content-between p-2 rounded ${selectedPlayer?.identifier === player.identifier ? 'active' : ''}`}
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className={`font-monospace ${selectedPlayer?.identifier === player.identifier ? 'text-primary-custom' : 'text-outline-variant'}`} style={{ fontSize: '0.75rem', width: '32px' }}>
                            #{idx + 1}
                          </span>
                          <span className={`fw-bold ${selectedPlayer?.identifier === player.identifier ? 'text-white' : 'text-white'}`} style={{ fontSize: '0.875rem' }}>
                            {[player.firstname, player.lastname].filter(Boolean).join(' ') || player.identifier}
                          </span>
                        </div>
                        {selectedPlayer?.identifier === player.identifier && (
                          <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '0.875rem' }}>chevron_right</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-secondary small">No hay jugadores conectados</div>
                  )}

                </div>
              </div>
            </aside>

            {/* Right Column: Detail View */}
            <section className="col-lg-8 col-xl-9 h-100">
              {selectedPlayer ? (
                <div className="glass-panel h-100 d-flex flex-column position-relative overflow-hidden">
                  {/* Detail Header */}
                  <header className="p-4 d-flex justify-content-between align-items-end position-relative border-outline-variant border-bottom" style={{ zIndex: 10 }}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge text-primary-custom text-uppercase fw-bold" style={{ backgroundColor: 'rgba(0, 209, 255, 0.1)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Target Locked</span>
                        <span className="font-monospace text-outline-variant" style={{ fontSize: '0.75rem' }}>ID: {selectedPlayer.identifier}</span>
                      </div>
                      <h1 className="m-0 fs-2 fw-bold text-white text-uppercase" style={{ letterSpacing: '-0.025em' }}>
                        {[selectedPlayer.firstname, selectedPlayer.lastname].filter(Boolean).join(' ') || selectedPlayer.identifier}
                      </h1>
                    </div>
                    <div className="text-end">
                      <div className="text-outline-variant text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Session Time</div>
                      <div className="fs-5 font-monospace text-on-surface-variant">00:00:00</div>
                    </div>
                  </header>

                  {/* Detail Content Canvas */}
                  <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar position-relative" style={{ zIndex: 10 }}>
                    <div className="d-flex flex-column gap-5">
                      
                      {/* Economy Editor */}
                      <div className="glass-panel p-4 position-relative overflow-hidden">
                        <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#0356ff' }}></div>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-secondary-custom">account_balance</span>
                          <h3 className="m-0 fs-5 text-white">Economy Parameters</h3>
                        </div>
                        <div className="row g-4">
                          <div className="col-md-4">
                            <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Cash Flow</label>
                            <div className="position-relative">
                              <span className="position-absolute text-outline-variant" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}>$</span>
                              <input 
                                className="form-control input-custom py-2" 
                                style={{ paddingLeft: '2rem', fontSize: '0.875rem', fontFamily: 'monospace' }} 
                                type="number" 
                                value={cash}
                                onChange={(e) => setCash(e.target.value)}
                              />
                              <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '2px', backgroundColor: '#0356ff' }}></div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Vault Reserves (Bank)</label>
                            <div className="position-relative">
                              <span className="position-absolute text-outline-variant" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}>$</span>
                              <input 
                                className="form-control input-custom py-2" 
                                style={{ paddingLeft: '2rem', fontSize: '0.875rem', fontFamily: 'monospace' }} 
                                type="number" 
                                value={bank}
                                onChange={(e) => setBank(e.target.value)}
                              />
                              <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '2px', backgroundColor: '#0356ff' }}></div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Black Money</label>
                            <div className="position-relative">
                              <span className="position-absolute text-outline-variant" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}>$</span>
                              <input 
                                className="form-control input-custom py-2" 
                                style={{ paddingLeft: '2rem', fontSize: '0.875rem', fontFamily: 'monospace', color: '#ffb4ab' }} 
                                type="number" 
                                value={vault}
                                onChange={(e) => setVault(e.target.value)}
                              />
                              <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '2px', backgroundColor: '#ffb4ab' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 d-flex justify-content-end">
                          <button onClick={handleSaveEconomy} className="btn btn-discord btn-sm px-4 py-2 fw-bold d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>save</span> Override Values
                          </button>
                        </div>
                      </div>

                      {/* Positioning & Garage */}
                      <div className="glass-panel p-4 position-relative overflow-hidden">
                        <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: 'rgba(60, 73, 78, 0.5)' }}></div>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                          <h3 className="m-0 fs-5 text-white">Spatial Coordinates</h3>
                        </div>
                        <div className="row g-4 align-items-end">
                          <div className="col-md-6">
                            <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Teleport Node</label>
                            <select className="form-select input-custom py-2" style={{ fontSize: '0.875rem' }}>
                              <option>City Center Plaza</option>
                              <option>Industrial District</option>
                              <option>LSPD Headquarters</option>
                              <option>Paleto Bay</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <button className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#0a0f14', color: '#dee3ea', border: '1px solid rgba(60, 73, 78, 0.3)', fontSize: '0.875rem' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>garage</span> Force Garage Recall
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="p-4 rounded position-relative overflow-hidden" style={{ backgroundColor: 'rgba(147, 0, 10, 0.1)', border: '1px solid rgba(255, 180, 171, 0.2)' }}>
                        <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#ffb4ab' }}></div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-error-custom">warning</span>
                          <h3 className="m-0 fs-5 text-error-custom">Danger Zone</h3>
                        </div>
                        <p className="text-on-surface-variant mb-4" style={{ fontSize: '0.875rem' }}>
                          These actions are immediate and will disrupt the target's current session. Proceed with protocol adherence.
                        </p>
                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
                            <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Kick Reason</label>
                            <input
                              type="text"
                              className="form-control form-control-sm input-custom"
                              placeholder="Expulsado desde UCP"
                              value={kickReason}
                              onChange={e => setKickReason(e.target.value)}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Ban Reason</label>
                            <input
                              type="text"
                              className="form-control form-control-sm input-custom"
                              placeholder="Baneado desde UCP"
                              value={banReason}
                              onChange={e => setBanReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-on-surface-variant text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Ban Duration</label>
                          <select
                            className="form-select form-select-sm"
                            style={{ backgroundColor: '#0a0f14', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)' }}
                            value={banDuration}
                            onChange={e => setBanDuration(e.target.value)}
                          >
                            <option value="1 hour">1 Hora</option>
                            <option value="6 hours">6 Horas</option>
                            <option value="1 day">1 Día</option>
                            <option value="3 days">3 Días</option>
                            <option value="1 week">1 Semana</option>
                            <option value="1 month">1 Mes</option>
                            <option value="permanent">Permanente</option>
                          </select>
                        </div>
                        <div className="d-flex flex-column flex-md-row gap-3">
                          <button onClick={handleKick} className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold" style={{ backgroundColor: '#0a0f14', color: '#ffb4ab', border: '1px solid rgba(255, 180, 171, 0.3)', fontSize: '0.875rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>front_hand</span> Terminate Session (Kick)
                          </button>
                          <button onClick={handleBan} className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase" style={{ backgroundColor: '#ffb4ab', color: '#690005', fontSize: '0.875rem', letterSpacing: '-0.025em', boxShadow: '0 0 20px -5px rgba(255,180,171,0.3)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>block</span> Permanent Exclusion (Ban)
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel h-100 d-flex justify-content-center align-items-center">
                  <div className="text-center text-outline-variant">
                    <span className="material-symbols-outlined d-block mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}>radar</span>
                    <h4 className="fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Awaiting Target</h4>
                    <p className="small">Select a link from the server radar to view details.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-100 border-top mt-auto" style={{ backgroundColor: '#0a0f14', borderColor: 'rgba(60, 73, 78, 0.1)' }}>
        <div className="container-fluid px-4 py-4 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="row g-4 align-items-center">
            <div className="col-md-4 text-center text-md-start">
              <span className="fs-5 fw-bold text-white">CyberUCP</span>
            </div>
            <div className="col-md-4 text-center">
              <span className="small text-secondary">© 2024 CyberUCP. No afiliado con Rockstar Games o Take-Two Interactive. TFG Project.</span>
            </div>
            <div className="col-md-4 d-flex flex-wrap justify-content-center justify-content-md-end gap-3">
              <a className="text-secondary text-decoration-none small" href="#">Discord</a>
              <a className="text-secondary text-decoration-none small" href="#">Reglas</a>
              <a className="text-secondary text-decoration-none small" href="#">Términos Legales</a>
              <a className="text-secondary text-decoration-none small" href="#">Soporte</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
