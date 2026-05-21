// Dashboard de administrador
// Permite buscar jugadores y modificar su economia, inventario, vehiculos, posicion
// Tambien permite expulsar o banear
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Funciones auxiliares ---

// Coge el token JWT de localStorage
const getToken = () => localStorage.getItem('jwt');

// Devuelve el objeto de configuracion para axios con el token en el header
const authHeader = () => {
  return { headers: { Authorization: `Bearer ${getToken()}` } };
};

// Saca el hash de la licencia desde el identifier ("char1:abc..." -> "abc...")
const getLicenseHash = (identifier) => {
  if (!identifier) return identifier;
  const colonIdx = identifier.indexOf(':');
  if (colonIdx !== -1) {
    return identifier.slice(colonIdx + 1);
  }
  return identifier;
};

// --- Panel de busqueda ---
// Permite buscar jugadores por nombre, trabajo, grupo o Discord ID
function SearchPanel({ onResults, showAlert }) {
  // Estado de la pestana activa y los inputs de cada una
  const [tab, setTab] = useState('name');
  const [nameQuery, setNameQuery] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [groupQuery, setGroupQuery] = useState('');
  const [discordQuery, setDiscordQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Hace la busqueda segun la pestana activa
  const search = async () => {
    setSearching(true);
    try {
      let res;

      // Segun la pestana, llamo a un endpoint diferente
      if (tab === 'name') {
        res = await axios.get(`/player-service/players/search?name=${encodeURIComponent(nameQuery)}`, authHeader());
        // Si llega un objeto en vez de array, lo meto en un array
        if (Array.isArray(res.data)) {
          onResults(res.data);
        } else if (res.data) {
          onResults([res.data]);
        } else {
          onResults([]);
        }
      } else if (tab === 'job') {
        res = await axios.get(`/player-service/players/job/${encodeURIComponent(jobQuery)}`, authHeader());
        onResults(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'group') {
        res = await axios.get(`/player-service/players/group/${encodeURIComponent(groupQuery)}`, authHeader());
        onResults(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'discord') {
        res = await axios.get(`/mgmt-service/players/discord/${encodeURIComponent(discordQuery)}`, authHeader());
        // El endpoint discord devuelve un objeto, no un array
        if (res.data) {
          onResults([res.data]);
        } else {
          onResults([]);
        }
      }
    } catch (e) {
      showAlert('No se encontraron resultados o error en la busqueda.', 'warning');
      onResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Estilo de los botones de pestana
  const tabStyle = (t) => {
    const isActive = tab === t;
    return {
      background: isActive ? 'rgba(0,209,255,0.15)' : 'transparent',
      color: isActive ? '#00d1ff' : '#94a3b8',
      border: 'none',
      borderBottom: isActive ? '2px solid #00d1ff' : '2px solid transparent',
      padding: '6px 12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      cursor: 'pointer',
      transition: 'all 0.2s',
    };
  };

  // Lista de pestanas que se renderizan
  const tabs = [
    { key: 'name', label: 'Nombre' },
    { key: 'job', label: 'Trabajo' },
    { key: 'group', label: 'Grupo' },
    { key: 'discord', label: 'Discord' },
  ];

  return (
    <div>
      {/* Botones de pestana */}
      <div className="d-flex border-bottom mb-3" style={{ borderColor: 'rgba(60,73,78,0.3) !important' }}>
        {tabs.map((t) => (
          <button key={t.key} style={tabStyle(t.key)} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Input de busqueda segun pestana */}
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
          {searching
            ? <span className="spinner-border spinner-border-sm" />
            : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>search</span>}
        </button>
      </div>
    </div>
  );
}

// --- Editor de economia ---
// Permite cambiar el efectivo, banco y dinero sucio de un jugador
function EconomyEditor({ player, showAlert, onUpdated }) {
  const [cash, setCash] = useState(0);
  const [bank, setBank] = useState(0);
  const [blackMoney, setBlackMoney] = useState(0);
  const [saving, setSaving] = useState(false);

  // Cuando cambia el jugador, parseo su JSON de accounts y relleno los inputs
  useEffect(() => {
    let acc = {};
    try {
      acc = JSON.parse(player?.accounts || '{}');
    } catch (e) {
      // si falla el parse dejo el objeto vacio
    }
    setCash(acc.money || 0);
    setBank(acc.bank || 0);
    setBlackMoney(acc.black_money || 0);
  }, [player]);

  // Guarda los cambios en el backend
  const handleSave = async () => {
    setSaving(true);
    try {
      // Monto el body con los numeros convertidos
      const body = {
        money: Number(cash),
        bank: Number(bank),
        black_money: Number(blackMoney),
      };
      await axios.put(`/player-service/players/${player.identifier}/economy`, body, authHeader());
      showAlert('Economia actualizada correctamente', 'success');

      // Actualizo el jugador en el padre para que se vea el cambio
      const playerActualizado = { ...player, accounts: JSON.stringify(body) };
      onUpdated(playerActualizado);
    } catch (e) {
      showAlert('Error al actualizar la economia', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Configuracion de los 3 inputs de dinero
  const campos = [
    { label: 'Efectivo', value: cash, setter: setCash, color: '#00d1ff' },
    { label: 'Banco', value: bank, setter: setBank, color: '#dee3ea' },
    { label: 'Dinero Sucio', value: blackMoney, setter: setBlackMoney, color: '#ffb4ab' },
  ];

  return (
    <div className="glass-panel p-4 position-relative">
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#0356ff', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="material-symbols-outlined" style={{ color: '#0356ff' }}>account_balance</span>
        <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Editor de Economia</h3>
      </div>
      <div className="row g-3">
        {campos.map((campo) => (
          <div className="col-md-4" key={campo.label}>
            <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>{campo.label}</label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3c494e' }}>$</span>
              <input
                type="number"
                className="form-control input-custom py-2"
                style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', fontSize: '0.875rem', color: campo.color }}
                value={campo.value}
                onChange={e => campo.setter(e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 d-flex justify-content-end">
        <button onClick={handleSave} disabled={saving} className="btn btn-sm px-4 py-2 fw-bold d-flex align-items-center gap-2" style={{ background: 'linear-gradient(to right,#0356ff,#00d1ff)', color: 'white', border: 'none' }}>
          {saving
            ? <span className="spinner-border spinner-border-sm" />
            : <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>save</span>}
          Guardar
        </button>
      </div>
    </div>
  );
}

// --- Gestor de inventario ---
// Permite ver, anadir, quitar y vaciar items del inventario
function InventoryManager({ player, showAlert }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [adding, setAdding] = useState(false);

  // Carga el inventario del jugador
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/player-service/players/${player.identifier}/inventory`, authHeader());
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [player.identifier]);

  // Cargo el inventario al cambiar de jugador
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Anade un item nuevo al inventario
  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      const url = `/player-service/players/${player.identifier}/inventory/${encodeURIComponent(newItem.trim())}?count=${newCount}`;
      await axios.post(url, {}, authHeader());
      showAlert(`Item "${newItem}" anadido`, 'success');
      setNewItem('');
      setNewCount(1);
      fetchInventory();
    } catch (e) {
      showAlert('Error al anadir el item', 'danger');
    } finally {
      setAdding(false);
    }
  };

  // Quita un item por su nombre
  const handleRemoveItem = async (itemName) => {
    try {
      const url = `/player-service/players/${player.identifier}/inventory/${encodeURIComponent(itemName)}`;
      await axios.delete(url, authHeader());
      showAlert(`Item "${itemName}" eliminado`, 'success');
      fetchInventory();
    } catch (e) {
      showAlert('Error al eliminar el item', 'danger');
    }
  };

  // Vacia el inventario entero (con confirmacion)
  const handleClearInventory = async () => {
    const confirma = window.confirm('Vaciar el inventario completo?');
    if (!confirma) return;

    try {
      await axios.put(`/player-service/players/${player.identifier}/inventory`, [], authHeader());
      showAlert('Inventario vaciado', 'success');
      setInventory([]);
    } catch (e) {
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

      {/* Formulario para anadir items */}
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
          {adding
            ? <span className="spinner-border spinner-border-sm" />
            : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>}
        </button>
      </div>

      {/* Lista de items */}
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
          <div className="text-center text-secondary py-3 small">El inventario esta vacio</div>
        )}
      </div>
    </div>
  );
}

// --- Gestor de vehiculos ---
// Permite ver los vehiculos del jugador y guardarlos/sacarlos del garaje
function VehicleManager({ player, showAlert }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carga los vehiculos del jugador
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/player-service/players/${player.identifier}/vehicles`, authHeader());
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [player.identifier]);

  // Recarga los vehiculos al cambiar de jugador
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Alterna el estado de un vehiculo (guardado o fuera)
  const handlePatchVehicle = async (plate, currentStored) => {
    const newStored = !currentStored;

    // Monto el body
    const body = { stored: newStored };
    if (newStored) {
      // Si lo guardo, le pongo un parking por defecto
      body.parking = 'SanAndreasAvenue';
    }

    try {
      const url = `/player-service/players/${player.identifier}/vehicles/${encodeURIComponent(plate)}`;
      await axios.patch(url, body, authHeader());
      showAlert(`Vehiculo ${plate} actualizado`, 'success');
      fetchVehicles();
    } catch (e) {
      showAlert('Error al actualizar el vehiculo', 'danger');
    }
  };

  return (
    <div className="glass-panel p-4 position-relative">
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: 'rgba(60,73,78,0.5)', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary">directions_car</span>
        <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Gestor de Flota</h3>
        <span className="badge" style={{ backgroundColor: 'rgba(148,163,184,0.1)', color: '#94a3b8', fontSize: '0.65rem' }}>{vehicles.length} VEHICULOS</span>
      </div>
      {loading ? (
        <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-info" /></div>
      ) : (
        <div className="custom-scrollbar overflow-auto" style={{ maxHeight: '180px' }}>
          {vehicles.length > 0 ? (
            <table className="table table-borderless mb-0 small align-middle" style={{ color: '#dee3ea' }}>
              <thead style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <tr>
                  <th className="py-1 px-2">Matricula</th>
                  <th className="py-1 px-2">Modelo</th>
                  <th className="py-1 px-2 text-center">Estado</th>
                  <th className="py-1 px-2 text-end">Accion</th>
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
            <div className="text-center text-secondary py-3 small">No hay vehiculos registrados</div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Control de posicion ---
// Permite teletransportar al jugador a unas coordenadas
function PositionControl({ player, showAlert }) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');
  const [heading, setHeading] = useState('0');
  const [saving, setSaving] = useState(false);

  // Cuando cambia el jugador, leo su posicion actual y la pongo en los inputs
  useEffect(() => {
    try {
      const pos = JSON.parse(player?.position || '{}');
      setX(pos.x ?? '');
      setY(pos.y ?? '');
      setZ(pos.z ?? '');
      setHeading(pos.heading ?? '0');
    } catch (e) {
      // Si falla el parse, dejo todo vacio
      setX('');
      setY('');
      setZ('');
      setHeading('0');
    }
  }, [player]);

  // Guarda la nueva posicion
  const handleTeleport = async () => {
    // Compruebo que tenga al menos x, y, z
    if (x === '' || y === '' || z === '') {
      showAlert('Rellena las coordenadas X, Y, Z', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = {
        x: Number(x),
        y: Number(y),
        z: Number(z),
        heading: Number(heading),
      };
      await axios.put(`/player-service/players/${player.identifier}/position`, body, authHeader());
      showAlert('Posicion actualizada correctamente', 'success');
    } catch (e) {
      showAlert('Error al actualizar la posicion', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Helper para renderizar un input de coordenada
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
        <h3 className="m-0 fs-6 fw-bold text-white text-uppercase" style={{ letterSpacing: '0.05em' }}>Control de Posicion</h3>
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
            {saving
              ? <span className="spinner-border spinner-border-sm" />
              : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>near_me</span>}
            Teletransportar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Zona peligrosa ---
// Permite expulsar (kick) o banear (ban) a un jugador
function DangerZone({ player, showAlert }) {
  const [kickReason, setKickReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [kicking, setKicking] = useState(false);
  const [banning, setBanning] = useState(false);

  // Expulsa al jugador del servidor
  const handleKick = async () => {
    setKicking(true);
    try {
      const body = {
        license: getLicenseHash(player.identifier),
        reason: kickReason.trim() || 'Expulsado desde UCP',
      };
      await axios.post('/mgmt-service/players/kick', body, authHeader());
      showAlert('Jugador expulsado correctamente', 'success');
    } catch (e) {
      showAlert('Error al expulsar al jugador', 'danger');
    } finally {
      setKicking(false);
    }
  };

  // Banea al jugador (pide confirmacion primero)
  const handleBan = async () => {
    // Pido confirmacion porque es algo grave
    const nombrePartes = [player.firstname, player.lastname].filter(Boolean);
    const nombreCompleto = nombrePartes.join(' ');
    const confirma = window.confirm(`Banear a ${nombreCompleto}?`);
    if (!confirma) return;

    setBanning(true);
    try {
      const body = {
        license: getLicenseHash(player.identifier),
        reason: banReason.trim() || 'Baneado desde UCP',
        duration: banDuration,
      };
      await axios.post('/mgmt-service/players/ban', body, authHeader());
      showAlert('Jugador baneado correctamente', 'success');
    } catch (e) {
      showAlert('Error al banear al jugador', 'danger');
    } finally {
      setBanning(false);
    }
  };

  // Opciones de duracion del ban
  const opcionesDuracion = [
    { value: '1 hour', label: '1 Hora' },
    { value: '6 hours', label: '6 Horas' },
    { value: '1 day', label: '1 Dia' },
    { value: '3 days', label: '3 Dias' },
    { value: '1 week', label: '1 Semana' },
    { value: '1 month', label: '1 Mes' },
    { value: 'permanent', label: 'Permanente' },
  ];

  return (
    <div className="p-4 rounded position-relative" style={{ backgroundColor: 'rgba(147,0,10,0.1)', border: '1px solid rgba(255,180,171,0.2)' }}>
      <div className="position-absolute start-0 top-0 bottom-0" style={{ width: '4px', backgroundColor: '#ffb4ab', borderRadius: '4px 0 0 4px' }} />
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-error-custom">warning</span>
        <h3 className="m-0 fs-6 fw-bold text-uppercase" style={{ color: '#ffb4ab', letterSpacing: '0.05em' }}>Zona de Peligro</h3>
      </div>
      <p className="small text-secondary mb-3">Las sanciones son inmediatas e irreversibles. Actua con responsabilidad.</p>
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
        <label className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Duracion del Ban</label>
        <select
          className="form-select form-select-sm"
          style={{ backgroundColor: '#0a0f14', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)' }}
          value={banDuration}
          onChange={e => setBanDuration(e.target.value)}
        >
          {opcionesDuracion.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="d-flex flex-column flex-md-row gap-3">
        <button
          onClick={handleKick}
          disabled={kicking}
          className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
          style={{ backgroundColor: '#0a0f14', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.3)', fontSize: '0.875rem' }}
        >
          {kicking
            ? <span className="spinner-border spinner-border-sm" />
            : <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>front_hand</span>}
          Expulsar (Kick)
        </button>
        <button
          onClick={handleBan}
          disabled={banning}
          className="btn flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase"
          style={{ backgroundColor: '#ffb4ab', color: '#690005', fontSize: '0.875rem', letterSpacing: '-0.025em', boxShadow: '0 0 20px -5px rgba(255,180,171,0.3)' }}
        >
          {banning
            ? <span className="spinner-border spinner-border-sm" />
            : <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>block</span>}
          Banear (Ban)
        </button>
      </div>
    </div>
  );
}

// --- Componente principal ---
// Junta todos los subcomponentes y maneja la lista de jugadores
export default function AdminDashboard() {
  const navigate = useNavigate();

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState({ status: 'offline', players: [], info: null });
  const [players, setPlayers] = useState([]);
  // Si hay resultados de busqueda los muestro; si es null muestro todos
  const [searchResults, setSearchResults] = useState(null);
  const [nameFilter, setNameFilter] = useState('');

  // Jugador seleccionado para editar
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Estado de la alerta flotante
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Muestra una alerta que desaparece a los 3.5 segundos
  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3500);
  }, []);

  // Carga los jugadores y el estado del servidor
  // Si silent = true no muestra el spinner (usado en el auto-refresh)
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
    }

    try {
      // Pido las dos cosas en paralelo
      const [playersRes, statusRes] = await Promise.all([
        axios.get('/player-service/players', authHeader()).catch(() => ({ data: [] })),
        axios.get('/mgmt-service/server/status', authHeader()).catch(() => ({ data: { status: 'offline', players: [], info: null } })),
      ]);

      setPlayers(Array.isArray(playersRes.data) ? playersRes.data : []);
      setServerStatus(statusRes.data ?? { status: 'offline', players: [], info: null });
      setLastUpdated(new Date());
    } catch (err) {
      // Si el token ha caducado, vuelvo al inicio
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('jwt');
        navigate('/');
      }
    } finally {
      setLoading(false);
      if (!silent) {
        setRefreshing(false);
      }
    }
  }, [navigate]);

  // Carga inicial + refresco automatico cada 30 segundos
  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 30000);
    // Limpio el intervalo cuando se desmonta el componente
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calcula que jugadores mostrar: o los de la busqueda o todos
  // Luego les aplica el filtro de nombre si lo hay
  const fuente = searchResults ?? players;
  const displayedPlayers = fuente.filter(p => {
    if (!nameFilter) return true;

    const filtroLower = nameFilter.toLowerCase();
    const nombrePartes = [p.firstname, p.lastname].filter(Boolean);
    const fullName = nombrePartes.join(' ').toLowerCase();

    if (fullName.includes(filtroLower)) return true;
    if (p.identifier?.toLowerCase().includes(filtroLower)) return true;
    return false;
  });

  // Datos del estado del servidor
  const isOnline = serverStatus.status === 'online';
  const onlineCount = Array.isArray(serverStatus.players) ? serverStatus.players.length : 0;

  // Saca el numero maximo de clientes (puede venir con dos nombres distintos)
  let maxClients = '??';
  if (serverStatus.info?.vars?.sv_maxClients !== undefined) {
    maxClients = serverStatus.info.vars.sv_maxClients;
  } else if (serverStatus.info?.vars?.sv_maxclients !== undefined) {
    maxClients = serverStatus.info.vars.sv_maxclients;
  }

  // Cierra sesion
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  // Mientras carga muestro un spinner
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#0a0f14' }}>
        <div className="spinner-border text-info" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    );
  }

  // Calculo el porcentaje de jugadores online (para la barra de progreso)
  let porcentajeOnline = 0;
  if (typeof maxClients === 'number' && maxClients > 0) {
    porcentajeOnline = Math.min((onlineCount / maxClients) * 100, 100);
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#0a0f14', color: '#dee3ea', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Alerta flotante */}
      {alert.show && (
        <div className="toast-alert">
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg mb-0`} role="alert">
            <strong>
              {alert.type === 'success' ? '✓ ' : alert.type === 'warning' ? '⚠ ' : '✗ '}
            </strong>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert(a => ({ ...a, show: false }))} />
          </div>
        </div>
      )}

      {/* Barra superior */}
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

      {/* Contenido principal */}
      <main className="flex-grow-1 w-100 pt-4 pb-5 px-3 px-md-4">
        <div className="container-fluid mx-auto p-0" style={{ maxWidth: '1536px' }}>
          <div className="row g-4" style={{ minHeight: 'calc(100vh - 140px)' }}>

            {/* Columna izquierda */}
            <aside className="col-lg-4 col-xl-3 d-flex flex-column gap-3">

              {/* Estado del servidor */}
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
                  <div style={{ height: '100%', borderRadius: '2px', width: `${porcentajeOnline}%`, background: 'linear-gradient(to right,#0356ff,#00d1ff)', transition: 'width 0.5s ease' }} />
                </div>
                {lastUpdated && (
                  <div className="mt-2 text-end" style={{ fontSize: '0.6rem', color: '#3c494e' }}>
                    Actualizado: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Buscador */}
              <div className="glass-panel p-4">
                <h2 className="text-secondary fw-semibold text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Motor de Busqueda</h2>
                <SearchPanel onResults={setSearchResults} showAlert={showAlert} />
                {searchResults !== null && (
                  <button
                    onClick={() => setSearchResults(null)}
                    className="btn btn-sm mt-2 w-100"
                    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)', fontSize: '0.75rem' }}
                  >
                    ✕ Limpiar busqueda - ver todos
                  </button>
                )}
              </div>

              {/* Lista de jugadores */}
              <div className="glass-panel d-flex flex-column overflow-hidden flex-grow-1" style={{ minHeight: '300px' }}>
                <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid rgba(60,73,78,0.2)' }}>
                  <span className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    {searchResults !== null
                      ? `Resultados (${displayedPlayers.length})`
                      : `Todos los jugadores (${players.length})`}
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
                  {displayedPlayers.length > 0 ? displayedPlayers.map((player, idx) => {
                    const nombrePartes = [player.firstname, player.lastname].filter(Boolean);
                    const nombre = nombrePartes.length > 0 ? nombrePartes.join(' ') : player.identifier;
                    const esSeleccionado = selectedPlayer?.identifier === player.identifier;

                    return (
                      <div
                        key={player.identifier || idx}
                        className={`player-item d-flex align-items-center justify-content-between px-3 py-2 ${esSeleccionado ? 'active' : ''}`}
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="font-monospace text-secondary" style={{ fontSize: '0.65rem', width: '28px' }}>#{idx + 1}</span>
                          <div>
                            <div className="fw-bold text-white" style={{ fontSize: '0.8rem' }}>{nombre}</div>
                            {player.job && <div className="text-secondary" style={{ fontSize: '0.65rem' }}>{player.job}</div>}
                          </div>
                        </div>
                        {esSeleccionado && (
                          <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: '0.875rem' }}>chevron_right</span>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center text-secondary small py-4">
                      {searchResults !== null ? 'Sin resultados' : 'No hay jugadores'}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Columna derecha: detalle del jugador seleccionado */}
            <section className="col-lg-8 col-xl-9">
              {selectedPlayer ? (
                <div className="glass-panel d-flex flex-column overflow-hidden" style={{ minHeight: '100%' }}>
                  {/* Cabecera del jugador */}
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

                  {/* Contenido: todos los editores */}
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
                // Si no hay jugador seleccionado muestro un mensaje
                <div className="glass-panel h-100 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                  <div className="text-center" style={{ color: '#3c494e' }}>
                    <span className="material-symbols-outlined d-block mb-3" style={{ fontSize: '4rem', opacity: 0.4 }}>manage_search</span>
                    <h4 className="fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Sin expediente cargado</h4>
                    <p className="small">Selecciona un jugador de la lista o usa el motor de busqueda.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Pie de pagina */}
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
              <a className="text-secondary text-decoration-none small" href="#">Terminos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
