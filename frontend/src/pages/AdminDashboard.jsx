import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('jwt');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const getLicenseHash = (identifier) => {
  const colonIdx = identifier?.indexOf(':');
  return colonIdx !== -1 ? identifier.slice(colonIdx + 1) : identifier;
};

// ─── Sub-component: Search Tabs ───────────────────────────────────────────────
function SearchPanel({ onResults, showAlert }) {
  const [tab, setTab] = useState('name');
  const [nameQuery, setNameQuery] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [groupQuery, setGroupQuery] = useState('');
  const [discordQuery, setDiscordQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const search = async () => {
    setSearching(true);
    try {
      let res;
      if (tab === 'name') {
        res = await axios.get(`/player-service/players/search?name=${encodeURIComponent(nameQuery)}`, authHeader());
        onResults(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean));
      } else if (tab === 'job') {
        res = await axios.get(`/player-service/players/job/${encodeURIComponent(jobQuery)}`, authHeader());
        onResults(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'group') {
        res = await axios.get(`/player-service/players/group/${encodeURIComponent(groupQuery)}`, authHeader());
        onResults(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'discord') {
        res = await axios.get(`/mgmt-service/players/discord/${encodeURIComponent(discordQuery)}`, authHeader());
        // returns single player or {license}
        const data = res.data;
        onResults(data ? [data] : []);
      }
    } catch {
      showAlert('No se encontraron resultados o error en la búsqueda.', 'warning');
      onResults([]);
    } finally {
      setSearching(false);
    }
  };

  const tabStyle = (t) => ({
    background: tab === t ? 'rgba(0,209,255,0.15)' : 'transparent',
    color: tab === t ? '#00d1ff' : '#94a3b8',
    border: 'none',
    borderBottom: tab === t ? '2px solid #00d1ff' : '2px solid transparent',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div>
      {/* Tabs */}
      <div className="d-flex border-bottom mb-3" style={{ borderColor: 'rgba(60,73,78,0.3) !important' }}>
        {[
          { key: 'name', label: 'Nombre' },
          { key: 'job', label: 'Trabajo' },
          { key: 'group', label: 'Grupo' },
          { key: 'discord', label: 'Discord' },
        ].map(({ key, label }) => (
          <button key={key} style={tabStyle(key)} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {/* Input */}
      <div className="d-flex gap-2">
        {tab === 'name' && (
          <input
            className="form-control input-custom py-1 flex-grow-1"
            style={{ fontSize: '0.8rem' }}
            placeholder="Nombre del personaje..."
            value={nameQuery}
            onChange={e => setNameQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        )}
        {tab === 'job' && (
          <input
            className="form-control input-custom py-1 flex-grow-1"
            style={{ fontSize: '0.8rem' }}
            placeholder="Ej: police, ambulance..."
            value={jobQuery}
            onChange={e => setJobQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        )}
        {tab === 'group' && (
          <input
            className="form-control input-custom py-1 flex-grow-1"
            style={{ fontSize: '0.8rem' }}
            placeholder="Ej: admin, user..."
            value={groupQuery}
            onChange={e => setGroupQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        )}
        {tab === 'discord' && (
          <input
            className="form-control input-custom py-1 flex-grow-1"
            style={{ fontSize: '0.8rem' }}
            placeholder="Discord ID..."
            value={discordQuery}
            onChange={e => setDiscordQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        )}
        <button
          onClick={search}
          disabled={searching}
          className="btn btn-sm px-3"
          style={{ background: 'linear-gradient(to right,#0356ff,#00d1ff)', color: 'white', border: 'none', fontSize: '0.75rem' }}
        >
          {searching ? <span className="spinner-border spinner-border-sm" /> : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>search</span>}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-component: Economy Editor ───────────────────────────────────────────
function EconomyEditor({ player, showAlert, onUpdated }) {
  const [cash, setCash] = useState(0);
  const [bank, setBank] = useState(0);
  const [blackMoney, setBlackMoney] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let acc = {};
    try { acc = JSON.parse(player?.accounts || '{}'); } catch { }
    setCash(acc.money || 0);
    setBank(acc.bank || 0);
    setBlackMoney(acc.black_money || 0);
  }, [player]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/player-service/players/${player.identifier}/economy`, {
        money: Number(cash),
        bank: Number(bank),
        black_money: Number(blackMoney),
      }, authHeader());
      showAlert('Economía actualizada correctamente', 'success');
      onUpdated({ ...player, accounts: JSON.stringify({ money: Number(cash), bank: Number(bank), black_money: Number(blackMoney) }) });
    } catch {
      showAlert('Error al actualizar la economía', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-4 position-relative">
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#0356ff', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="material-symbols-outlined" style={{ color: '#0356ff' }}>account_balance</span>
        <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Editor de Economía</h3>
      </div>
      <div className="row g-3">
        {[
          { label: 'Efectivo', value: cash, setter: setCash, color: '#00d1ff' },
          { label: 'Banco', value: bank, setter: setBank, color: '#dee3ea' },
          { label: 'Dinero Sucio', value: blackMoney, setter: setBlackMoney, color: '#ffb4ab' },
        ].map(({ label, value, setter, color }) => (
          <div className="col-md-4" key={label}>
            <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>{label}</label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3c494e' }}>$</span>
              <input
                type="number"
                className="form-control input-custom py-2"
                style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', fontSize: '0.875rem', color }}
                value={value}
                onChange={e => setter(e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 d-flex justify-content-end">
        <button onClick={handleSave} disabled={saving} className="btn btn-sm px-4 py-2 fw-bold d-flex align-items-center gap-2" style={{ background: 'linear-gradient(to right,#0356ff,#00d1ff)', color: 'white', border: 'none' }}>
          {saving ? <span className="spinner-border spinner-border-sm" /> : <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>save</span>}
          Guardar
        </button>
      </div>
    </div>
  );
}

// ─── Sub-component: Inventory Manager ────────────────────────────────────────
function InventoryManager({ player, showAlert }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [adding, setAdding] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/player-service/players/${player.identifier}/inventory`, authHeader());
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [player.identifier]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      await axios.post(`/player-service/players/${player.identifier}/inventory/${encodeURIComponent(newItem.trim())}?count=${newCount}`, {}, authHeader());
      showAlert(`Item "${newItem}" añadido`, 'success');
      setNewItem('');
      setNewCount(1);
      fetchInventory();
    } catch {
      showAlert('Error al añadir el item', 'danger');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (itemName) => {
    try {
      await axios.delete(`/player-service/players/${player.identifier}/inventory/${encodeURIComponent(itemName)}`, authHeader());
      showAlert(`Item "${itemName}" eliminado`, 'success');
      fetchInventory();
    } catch {
      showAlert('Error al eliminar el item', 'danger');
    }
  };

  const handleClearInventory = async () => {
    if (!window.confirm('¿Vaciar el inventario completo?')) return;
    try {
      await axios.put(`/player-service/players/${player.identifier}/inventory`, [], authHeader());
      showAlert('Inventario vaciado', 'success');
      setInventory([]);
    } catch {
      showAlert('Error al vaciar el inventario', 'danger');
    }
  };

  return (
    <div className="glass-panel p-4 position-relative">
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#00d1ff', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary-custom">inventory_2</span>
          <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Gestor de Inventario</h3>
          <span className="badge" style={{ backgroundColor: 'rgba(0,209,255,0.1)', color: '#00d1ff', fontSize: '0.65rem' }}>{inventory.length} ITEMS</span>
        </div>
        <button
          onClick={handleClearInventory}
          className="btn btn-sm"
          title="Vaciar inventario"
          style={{ backgroundColor: 'rgba(255,180,171,0.1)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)', fontSize: '0.75rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>delete_sweep</span> Vaciar
        </button>
      </div>

      {/* Add item form */}
      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control input-custom py-1 flex-grow-1"
          style={{ fontSize: '0.8rem' }}
          placeholder="Nombre del item (ej: water, bread...)"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddItem()}
        />
        <input
          type="number"
          className="form-control input-custom py-1"
          style={{ width: '70px', fontSize: '0.8rem' }}
          min="1"
          value={newCount}
          onChange={e => setNewCount(e.target.value)}
        />
        <button
          onClick={handleAddItem}
          disabled={adding}
          className="btn btn-sm px-3"
          style={{ background: 'rgba(0,209,255,0.15)', color: '#00d1ff', border: '1px solid rgba(0,209,255,0.3)', fontSize: '0.75rem' }}
        >
          {adding ? <span className="spinner-border spinner-border-sm" /> : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>}
        </button>
      </div>

      {/* Item list */}
      <div className="custom-scrollbar overflow-auto" style={{ maxHeight: '180px' }}>
        {loading ? (
          <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-info" /></div>
        ) : inventory.length > 0 ? (
          <div className="d-flex flex-column gap-1">
            {inventory.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center justify-content-between px-3 py-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '1rem' }}>category</span>
                  <span className="small text-white">{item.label || item.name}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info text-dark fw-bold px-2">x{item.count}</span>
                  <button
                    onClick={() => handleRemoveItem(item.name)}
                    className="btn btn-sm p-0"
                    title="Eliminar item"
                    style={{ background: 'none', border: 'none', color: '#ffb4ab', lineHeight: 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary py-3 small">El inventario está vacío</div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component: Vehicle Manager ──────────────────────────────────────────
function VehicleManager({ player, showAlert }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/player-service/players/${player.identifier}/vehicles`, authHeader());
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [player.identifier]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handlePatchVehicle = async (plate, currentStored) => {
    const newStored = !currentStored;
    const body = { stored: newStored };
    if (newStored) body.parking = 'SanAndreasAvenue';
    try {
      await axios.patch(`/player-service/players/${player.identifier}/vehicles/${encodeURIComponent(plate)}`, body, authHeader());
      showAlert(`Vehículo ${plate} actualizado`, 'success');
      fetchVehicles();
    } catch {
      showAlert('Error al actualizar el vehículo', 'danger');
    }
  };

  return (
    <div className="glass-panel p-4 position-relative">
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: 'rgba(60,73,78,0.5)', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary">directions_car</span>
        <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Gestor de Flota</h3>
        <span className="badge" style={{ backgroundColor: 'rgba(148,163,184,0.1)', color: '#94a3b8', fontSize: '0.65rem' }}>{vehicles.length} VEHÍCULOS</span>
      </div>
      {loading ? (
        <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-info" /></div>
      ) : (
        <div className="custom-scrollbar overflow-auto" style={{ maxHeight: '180px' }}>
          {vehicles.length > 0 ? (
            <table className="table table-borderless mb-0 small align-middle" style={{ color: '#dee3ea' }}>
              <thead style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <tr>
                  <th className="py-1 px-2">Matrícula</th>
                  <th className="py-1 px-2">Modelo</th>
                  <th className="py-1 px-2 text-center">Estado</th>
                  <th className="py-1 px-2 text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="py-2 px-2 font-monospace" style={{ color: '#00d1ff' }}>{v.plate}</td>
                    <td className="py-2 px-2">{v.model || v.hash}</td>
                    <td className="py-2 px-2 text-center">
                      {v.stored
                        ? <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(0,209,255,0.2)', color: '#00d1ff', fontSize: '0.6rem' }}>GARAJE</span>
                        : <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(3,86,255,0.2)', color: '#4cd6ff', fontSize: '0.6rem' }}>FUERA</span>
                      }
                    </td>
                    <td className="py-2 px-2 text-end">
                      <button
                        onClick={() => handlePatchVehicle(v.plate, v.stored)}
                        className="btn btn-sm py-0 px-2"
                        title={v.stored ? 'Sacar del garaje' : 'Guardar en garaje'}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#dee3ea', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>{v.stored ? 'directions_car' : 'garage'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-secondary py-3 small">No hay vehículos registrados</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Position Control ─────────────────────────────────────────
function PositionControl({ player, showAlert }) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');
  const [heading, setHeading] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const pos = JSON.parse(player?.position || '{}');
      setX(pos.x ?? '');
      setY(pos.y ?? '');
      setZ(pos.z ?? '');
      setHeading(pos.heading ?? '0');
    } catch {
      setX(''); setY(''); setZ(''); setHeading('0');
    }
  }, [player]);

  const handleTeleport = async () => {
    if (x === '' || y === '' || z === '') { showAlert('Rellena las coordenadas X, Y, Z', 'warning'); return; }
    setSaving(true);
    try {
      await axios.put(`/player-service/players/${player.identifier}/position`, {
        x: Number(x), y: Number(y), z: Number(z), heading: Number(heading),
      }, authHeader());
      showAlert('Posición actualizada correctamente', 'success');
    } catch {
      showAlert('Error al actualizar la posición', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const coordInput = (label, value, setter, color = '#dee3ea') => (
    <div className="col-6 col-md-3">
      <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>{label}</label>
      <input
        type="number"
        className="form-control input-custom py-1"
        style={{ fontSize: '0.8rem', fontFamily: 'monospace', color }}
        placeholder={label}
        value={value}
        onChange={e => setter(e.target.value)}
      />
    </div>
  );

  return (
    <div className="glass-panel p-4 position-relative">
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: 'rgba(60,73,78,0.5)', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary">location_on</span>
        <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Control de Posición</h3>
      </div>
      <div className="row g-2 align-items-end">
        {coordInput('X', x, setX, '#4cd6ff')}
        {coordInput('Y', y, setY, '#4cd6ff')}
        {coordInput('Z', z, setZ, '#4cd6ff')}
        {coordInput('Heading', heading, setHeading, '#94a3b8')}
        <div className="col-12 col-md-auto mt-2">
          <button
            onClick={handleTeleport}
            disabled={saving}
            className="btn btn-sm px-4 py-2 fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ background: 'rgba(0,209,255,0.1)', color: '#00d1ff', border: '1px solid rgba(0,209,255,0.3)', fontSize: '0.8rem' }}
          >
            {saving ? <span className="spinner-border spinner-border-sm" /> : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>near_me</span>}
            Teletransportar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Danger Zone ───────────────────────────────────────────────
function DangerZone({ player, showAlert }) {
  const [kickReason, setKickReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [kicking, setKicking] = useState(false);
  const [banning, setBanning] = useState(false);

  const handleKick = async () => {
    setKicking(true);
    try {
      await axios.post('/mgmt-service/players/kick', {
        license: getLicenseHash(player.identifier),
        reason: kickReason.trim() || 'Expulsado desde UCP',
      }, authHeader());
      showAlert('Jugador expulsado correctamente', 'success');
    } catch {
      showAlert('Error al expulsar al jugador', 'danger');
    } finally {
      setKicking(false);
    }
  };

  const handleBan = async () => {
    if (!window.confirm(`¿Banear a ${[player.firstname, player.lastname].filter(Boolean).join(' ')}?`)) return;
    setBanning(true);
    try {
      await axios.post('/mgmt-service/players/ban', {
        license: getLicenseHash(player.identifier),
        reason: banReason.trim() || 'Baneado desde UCP',
        duration: banDuration,
      }, authHeader());
      showAlert('Jugador baneado correctamente', 'success');
    } catch {
      showAlert('Error al banear al jugador', 'danger');
    } finally {
      setBanning(false);
    }
  };

  return (
    <div className="p-4 rounded position-relative" style={{ backgroundColor: 'rgba(147,0,10,0.1)', border: '1px solid rgba(255,180,171,0.2)' }}>
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#ffb4ab', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-error-custom">warning</span>
        <h3 className="m-0 fs-6 fw-bold text-uppercase" style={{ color: '#ffb4ab', letterSpacing: '0.05em' }}>Zona de Peligro</h3>
      </div>
      <p className="small text-secondary mb-3">Las sanciones son inmediatas e irreversibles. Actúa con responsabilidad.</p>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Motivo del Kick</label>
          <input
            type="text"
            className="form-control form-control-sm input-custom"
            placeholder="Expulsado desde UCP"
            value={kickReason}
            onChange={e => setKickReason(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Motivo del Ban</label>
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
        <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Duración del Ban</label>
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
        <button
          onClick={handleKick}
          disabled={kicking}
          className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
          style={{ backgroundColor: '#0a0f14', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)', fontSize: '0.875rem' }}
        >
          {kicking ? <span className="spinner-border spinner-border-sm" /> : <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>front_hand</span>}
          Expulsar (Kick)
        </button>
        <button
          onClick={handleBan}
          disabled={banning}
          className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase"
          style={{ backgroundColor: '#ffb4ab', color: '#690005', fontSize: '0.875rem', letterSpacing: '-0.025em', boxShadow: '0 0 20px -5px rgba(255,180,171,0.3)' }}
        >
          {banning ? <span className="spinner-border spinner-border-sm" /> : <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>block</span>}
          Banear (Ban)
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState({ status: 'offline', players: [], info: null });
  const [players, setPlayers] = useState([]);
  const [searchResults, setSearchResults] = useState(null); // null = show all players
  const [nameFilter, setNameFilter] = useState('');

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [playersRes, statusRes] = await Promise.all([
        axios.get('/player-service/players', authHeader()).catch(() => ({ data: [] })),
        axios.get('/mgmt-service/server/status', authHeader()).catch(() => ({ data: { status: 'offline', players: [], info: null } })),
      ]);
      setPlayers(Array.isArray(playersRes.data) ? playersRes.data : []);
      setServerStatus(statusRes.data ?? { status: 'offline', players: [], info: null });
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('jwt');
        navigate('/');
      }
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  }, [navigate]);

  // Carga inicial + polling cada 30 segundos
  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const displayedPlayers = (searchResults ?? players).filter(p => {
    if (!nameFilter) return true;
    const fullName = [p.firstname, p.lastname].filter(Boolean).join(' ').toLowerCase();
    return fullName.includes(nameFilter.toLowerCase()) || p.identifier?.toLowerCase().includes(nameFilter.toLowerCase());
  });

  const isOnline = serverStatus.status === 'online';
  const onlineCount = Array.isArray(serverStatus.players) ? serverStatus.players.length : 0;
  const maxClients = serverStatus.info?.vars?.sv_maxClients ?? serverStatus.info?.vars?.sv_maxclients ?? '??';

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#0a0f14' }}>
        <div className="spinner-border text-info" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#0a0f14', color: '#dee3ea', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Floating Alert */}
      {alert.show && (
        <div className="toast-alert">
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg mb-0`} role="alert">
            <strong>{alert.type === 'success' ? '✓ ' : alert.type === 'warning' ? '⚠ ' : '✗ '}</strong>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert(a => ({ ...a, show: false }))} />
          </div>
        </div>
      )}

      {/* TopNavBar */}
      <header className="sticky-top shadow-sm site-header">
        <div className="container-fluid px-4 py-3 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4 fw-bold text-uppercase" style={{ color: '#4cd6ff', letterSpacing: '0.1em' }}>CyberUCP</span>
              <span className="badge ms-1 text-uppercase fw-bold" style={{ backgroundColor: '#00d1ff', color: '#00566a', fontSize: '0.6rem', letterSpacing: '0.1em' }}>Admin Mode</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn btn-sm px-3 py-2" style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)', fontSize: '0.8rem' }}>
                ← Panel Jugador
              </button>
              <button onClick={handleLogout} className="btn btn-sm px-4 py-2 fw-bold" style={{ background: 'linear-gradient(to right,#0356ff,#00d1ff)', color: 'white', border: 'none' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow-1 w-100 pt-4 pb-5 px-3 px-md-4">
        <div className="container-fluid mx-auto p-0" style={{ maxWidth: '1536px' }}>
          <div className="row g-4" style={{ minHeight: 'calc(100vh - 140px)' }}>

            {/* ── Left Column ── */}
            <aside className="col-lg-4 col-xl-3 d-flex flex-column gap-3">

              {/* Server Status */}
              <div className="glass-panel p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h2 className="text-secondary fw-semibold text-uppercase m-0" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Estado del Servidor</h2>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle"
                      style={{ width: '10px', height: '10px', backgroundColor: isOnline ? '#22c55e' : '#ef4444', boxShadow: isOnline ? '0 0 8px rgba(34,197,94,0.8)' : '0 0 8px rgba(239,68,68,0.8)' }}
                    />
                    <span className="fw-bold text-uppercase" style={{ fontSize: '0.7rem', color: isOnline ? '#22c55e' : '#ef4444' }}>{isOnline ? 'Online' : 'Offline'}</span>
                    <button
                      onClick={() => fetchData(false)}
                      disabled={refreshing}
                      title="Actualizar ahora"
                      style={{ background: 'none', border: 'none', padding: '2px', color: '#3c494e', cursor: 'pointer', lineHeight: 1 }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '0.9rem', display: 'block', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
                      >refresh</span>
                    </button>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-secondary small">Jugadores conectados</span>
                  <span className="font-monospace fw-bold text-primary-custom">{onlineCount} / {maxClients}</span>
                </div>
                <div className="mt-2" style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${typeof maxClients === 'number' ? Math.min((onlineCount / maxClients) * 100, 100) : 0}%`, background: 'linear-gradient(to right,#0356ff,#00d1ff)', transition: 'width 0.5s ease' }} />
                </div>
                {lastUpdated && (
                  <div className="mt-2 text-end" style={{ fontSize: '0.6rem', color: '#3c494e' }}>
                    Actualizado: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="glass-panel p-4">
                <h2 className="text-secondary fw-semibold text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Motor de Búsqueda</h2>
                <SearchPanel onResults={setSearchResults} showAlert={showAlert} />
                {searchResults !== null && (
                  <button
                    onClick={() => setSearchResults(null)}
                    className="btn btn-sm mt-2 w-100"
                    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)', fontSize: '0.75rem' }}
                  >
                    ✕ Limpiar búsqueda — ver todos
                  </button>
                )}
              </div>

              {/* Player List */}
              <div className="glass-panel d-flex flex-column overflow-hidden flex-grow-1" style={{ minHeight: '300px' }}>
                <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid rgba(60,73,78,0.2)' }}>
                  <span className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    {searchResults !== null ? `Resultados (${displayedPlayers.length})` : `Todos los jugadores (${players.length})`}
                  </span>
                  <input
                    className="form-control input-custom py-1"
                    style={{ width: '130px', fontSize: '0.7rem' }}
                    placeholder="Filtrar..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                  />
                </div>
                <div className="flex-grow-1 overflow-auto p-2 d-flex flex-column gap-1 custom-scrollbar">
                  {displayedPlayers.length > 0 ? displayedPlayers.map((player, idx) => (
                    <div
                      key={player.identifier || idx}
                      className={`player-item d-flex align-items-center justify-content-between px-3 py-2 ${selectedPlayer?.identifier === player.identifier ? 'active' : ''}`}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="font-monospace text-secondary" style={{ fontSize: '0.65rem', width: '28px' }}>#{idx + 1}</span>
                        <div>
                          <div className="fw-bold text-white" style={{ fontSize: '0.8rem' }}>
                            {[player.firstname, player.lastname].filter(Boolean).join(' ') || player.identifier}
                          </div>
                          {player.job && <div className="text-secondary" style={{ fontSize: '0.65rem' }}>{player.job}</div>}
                        </div>
                      </div>
                      {selectedPlayer?.identifier === player.identifier && (
                        <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '0.875rem' }}>chevron_right</span>
                      )}
                    </div>
                  )) : (
                    <div className="text-center text-secondary small py-4">
                      {searchResults !== null ? 'Sin resultados' : 'No hay jugadores'}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* ── Right Column ── */}
            <section className="col-lg-8 col-xl-9">
              {selectedPlayer ? (
                <div className="glass-panel d-flex flex-column overflow-hidden" style={{ minHeight: '100%' }}>
                  {/* Header */}
                  <div className="p-4 d-flex flex-wrap justify-content-between align-items-start gap-3" style={{ borderBottom: '1px solid rgba(60,73,78,0.2)' }}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge text-uppercase fw-bold" style={{ backgroundColor: 'rgba(0,209,255,0.1)', color: '#00d1ff', fontSize: '0.6rem', letterSpacing: '0.1em' }}>Expediente</span>
                        <span className="font-monospace text-secondary" style={{ fontSize: '0.7rem' }}>{selectedPlayer.identifier}</span>
                      </div>
                      <h1 className="m-0 fs-3 fw-bold text-white text-uppercase" style={{ letterSpacing: '-0.025em' }}>
                        {[selectedPlayer.firstname, selectedPlayer.lastname].filter(Boolean).join(' ') || selectedPlayer.identifier}
                      </h1>
                      <div className="d-flex gap-2 mt-1 flex-wrap">
                        {selectedPlayer.job && (
                          <span className="badge" style={{ backgroundColor: 'rgba(3,86,255,0.15)', color: '#4cd6ff', fontSize: '0.65rem' }}>
                            {selectedPlayer.job}
                          </span>
                        )}
                        {selectedPlayer.group && (
                          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.65rem' }}>
                            {selectedPlayer.group}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="btn btn-sm"
                      style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)', fontSize: '0.75rem' }}
                    >
                      ✕ Cerrar
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                    <div className="d-flex flex-column gap-4">
                      <EconomyEditor
                        player={selectedPlayer}
                        showAlert={showAlert}
                        onUpdated={updated => setSelectedPlayer(updated)}
                      />
                      <InventoryManager player={selectedPlayer} showAlert={showAlert} />
                      <VehicleManager player={selectedPlayer} showAlert={showAlert} />
                      <PositionControl player={selectedPlayer} showAlert={showAlert} />
                      <DangerZone player={selectedPlayer} showAlert={showAlert} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel h-100 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                  <div className="text-center" style={{ color: '#3c494e' }}>
                    <span className="material-symbols-outlined d-block mb-3" style={{ fontSize: '4rem', opacity: 0.4 }}>manage_search</span>
                    <h4 className="fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Sin expediente cargado</h4>
                    <p className="small">Selecciona un jugador de la lista o usa el motor de búsqueda.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-100 border-top mt-auto" style={{ backgroundColor: '#0a0f14', borderColor: 'rgba(60,73,78,0.1)' }}>
        <div className="container-fluid px-4 py-4 mx-auto" style={{ maxWidth: '1536px' }}>
          <div className="row g-2 align-items-center">
            <div className="col-md-4 text-center text-md-start">
              <span className="fs-6 fw-bold text-white">CyberUCP</span>
            </div>
            <div className="col-md-4 text-center">
              <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>© 2024 CyberUCP. TFG Project.</span>
            </div>
            <div className="col-md-4 d-flex flex-wrap justify-content-center justify-content-md-end gap-3">
              <a className="text-secondary text-decoration-none small" href="#">Discord</a>
              <a className="text-secondary text-decoration-none small" href="#">Reglas</a>
              <a className="text-secondary text-decoration-none small" href="#">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
