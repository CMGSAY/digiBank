// Transferencias.jsx - Módulo de Transferencias de DigiBank MVP (Diseño Corporativo Con Layout Integrado)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { 
  Send, Landmark, RefreshCw, CheckCircle2, 
  AlertCircle, UserCheck, ArrowRight
} from 'lucide-react';

function Transferencias() {
  const navigate = useNavigate();

  // === ESTADOS MANTENIDOS INTACTOS ===
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Selector Cuenta Origen
  const [cuentaOrigenId, setCuentaOrigenId] = useState('');
  const [cuentaOrigenObj, setCuentaOrigenObj] = useState(null);

  // Control de pestañas (Tabs)
  const [tabActiva, setTabActiva] = useState('PROPIAS'); // PROPIAS o AJENAS

  // Formulario Transferencias Propias
  const [cuentaDestinoIdPropia, setCuentaDestinoIdPropia] = useState('');
  const [montoPropia, setMontoPropia] = useState('');

  // Formulario Transferencias Ajenas
  const [cuentaDestinoNumeroAjena, setCuentaDestinoNumeroAjena] = useState('');
  const [validandoDestino, setValidandoDestino] = useState(false);
  const [titularValidado, setTitularValidado] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');
  const [montoAjena, setMontoAjena] = useState('');

  // Enviar formulario (Procesando)
  const [transferiendo, setTransferiendo] = useState(false);

  // Cargar cuentas del usuario logueado
  const cargarCuentas = async () => {
    try {
      setCargando(true);
      setErrorGlobal('');
      const response = await axiosInstance.get('/cuentas');
      if (response.data && response.data.success) {
        setCuentas(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar cuentas:', err);
      setErrorGlobal('No se pudieron obtener tus cuentas bancarias. Por favor intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  // Manejar selección de cuenta origen
  const handleSelectOrigen = (e) => {
    const val = e.target.value;
    setCuentaOrigenId(val);
    const cuenta = cuentas.find(c => c.id_cuenta === parseInt(val));
    setCuentaOrigenObj(cuenta || null);

    // Limpiar campos dependientes
    setCuentaDestinoIdPropia('');
    setCuentaDestinoNumeroAjena('');
    setTitularValidado('');
    setErrorValidacion('');
  };

  // Validar cuenta ajena (tercero)
  const validarCuentaDestino = async () => {
    if (!cuentaDestinoNumeroAjena.trim()) return;
    try {
      setValidandoDestino(true);
      setErrorValidacion('');
      setTitularValidado('');

      const response = await axiosInstance.get(`/cuentas/validar/${cuentaDestinoNumeroAjena.trim()}`);
      if (response.data && response.data.success) {
        setTitularValidado(response.data.data.titular);
      }
    } catch (err) {
      console.error('Error al validar cuenta:', err);
      setErrorValidacion(err.response?.data?.error?.message || 'Cuenta no encontrada o inválida.');
    } finally {
      setValidandoDestino(false);
    }
  };

  // Procesar transferencia
  const handleTransferir = async (e) => {
    e.preventDefault();
    if (!cuentaOrigenId) return;

    const esPropia = tabActiva === 'PROPIAS';
    const montoOperar = esPropia ? montoPropia : montoAjena;
    const destino = esPropia ? cuentaDestinoIdPropia : cuentaDestinoNumeroAjena;

    if (!destino) {
      setErrorGlobal('Por favor selecciona o valida la cuenta de destino.');
      return;
    }

    if (!montoOperar || parseFloat(montoOperar) <= 0) {
      setErrorGlobal('El monto a transferir debe ser mayor a cero.');
      return;
    }

    try {
      setTransferiendo(true);
      setErrorGlobal('');
      setMensajeExito('');

      const response = await axiosInstance.post('/transacciones/transferencia', {
        cuenta_origen: parseInt(cuentaOrigenId),
        cuenta_destino: esPropia ? parseInt(destino) : destino,
        monto: parseFloat(montoOperar),
        tipo: esPropia ? 'propia' : 'ajena'
      });

      if (response.data && response.data.success) {
        setMensajeExito(`¡Transferencia completada con éxito! Referencia: ${response.data.data.numero_referencia}`);
        // Resetear campos
        setMontoPropia('');
        setMontoAjena('');
        setCuentaDestinoIdPropia('');
        setCuentaDestinoNumeroAjena('');
        setTitularValidado('');
        // Recargar saldos
        cargarCuentas();
      }
    } catch (err) {
      console.error('Error al procesar transferencia:', err);
      setErrorGlobal(err.response?.data?.error?.message || 'Ocurrió un error al realizar la transferencia. Intenta de nuevo.');
    } finally {
      setTransferiendo(false);
    }
  };

  // Otras cuentas para transferencias propias
  const otrasCuentasUsuario = cuentas.filter(c => c.id_cuenta !== parseInt(cuentaOrigenId));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. Menú Lateral (Sidebar) */}
      <Sidebar />
      
      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* 2. Barra de Navegación Superior (Navbar) */}
        <Navbar />
        
        {/* 3. Área de Contenido Principal Paginado */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Cabecera del Módulo */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Transferencias</h1>
                <p className="text-slate-500 text-xs mt-1">Realiza transferencias inmediatas de fondos entre tus cuentas o a terceros en quetzales o dólares.</p>
              </div>
            </div>

            {/* Alertas Globales de Estado */}
            {errorGlobal && (
              <div className="p-4 bg-red-50 text-red-800 text-sm font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                {errorGlobal}
              </div>
            )}

            {mensajeExito && (
              <div className="p-4 bg-green-50 text-green-800 text-sm font-bold rounded-xl border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                {mensajeExito}
              </div>
            )}

            {/* Menú de Pestañas (Tabs) Alineado a la izquierda */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 w-fit">
              <button
                type="button"
                onClick={() => { setTabActiva('PROPIAS'); setErrorGlobal(''); }}
                className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  tabActiva === 'PROPIAS'
                    ? 'bg-[#003B7A] text-white shadow-sm'
                    : 'text-slate-500 hover:text-[#003B7A] bg-transparent'
                }`}
              >
                Transferencias propias
              </button>
              <button
                type="button"
                onClick={() => { setTabActiva('AJENAS'); setErrorGlobal(''); }}
                className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  tabActiva === 'AJENAS'
                    ? 'bg-[#003B7A] text-white shadow-sm'
                    : 'text-slate-500 hover:text-[#003B7A] bg-transparent'
                }`}
              >
                Transferencias ajenas
              </button>
            </div>

            {/* Tarjeta del Formulario Principal */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
              
              {/* Encabezado de la Tarjeta */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Send className="w-5 h-5 text-[#00A4E0]" />
                <h3 className="text-base font-bold text-[#003B7A]">
                  {tabActiva === 'PROPIAS' ? 'Operación: Transferencia entre Cuentas Propias' : 'Operación: Transferencia a Cuentas de Terceros'}
                </h3>
              </div>

              <form onSubmit={handleTransferir} className="space-y-6">

                {/* 1. SECCIÓN DE CUENTA ORIGEN (Común) */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                      Cuenta de Origen
                    </label>
                    <select
                      value={cuentaOrigenId}
                      onChange={handleSelectOrigen}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-medium"
                      required
                    >
                      <option value="">Selecciona cuenta origen...</option>
                      {cuentas.map(c => (
                        <option key={c.id_cuenta} value={c.id_cuenta}>
                          {c.tipo_cuenta} - {c.numero_cuenta} ({c.codigo_iso})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grid de Detalles de Cuenta Origen (Solo Texto) */}
                  {cuentaOrigenObj && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Número de cuenta</span>
                        <span className="text-slate-800 font-bold text-sm mt-0.5 block">{cuentaOrigenObj.numero_cuenta}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Nombre de cuenta</span>
                        <span className="text-slate-800 font-semibold text-sm mt-0.5 block">{cuentaOrigenObj.tipo_cuenta}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Tipo de cuenta</span>
                        <span className="text-slate-600 font-medium text-sm mt-0.5 block">Monetaria / Ahorros</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Saldo disponible</span>
                        <span className="text-[#003B7A] font-extrabold text-sm mt-0.5 block">
                          Q {parseFloat(cuentaOrigenObj.saldo).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. LOGICA TABS PROPIAS */}
                {tabActiva === 'PROPIAS' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                        Mis cuentas (Destino)
                      </label>
                      <select
                        value={cuentaDestinoIdPropia}
                        onChange={(e) => setCuentaDestinoIdPropia(e.target.value)}
                        disabled={!cuentaOrigenId}
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-medium disabled:opacity-60"
                        required
                      >
                        <option value="">Selecciona cuenta destino...</option>
                        {otrasCuentasUsuario.map(c => (
                          <option key={c.id_cuenta} value={c.id_cuenta}>
                            {c.tipo_cuenta} - {c.numero_cuenta} (Saldo: Q {parseFloat(c.saldo).toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                        Monto a transferir
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                          Q
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={montoPropia}
                          onChange={(e) => setMontoPropia(e.target.value)}
                          disabled={!cuentaOrigenId}
                          placeholder="0.00"
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-bold text-slate-800 disabled:opacity-60"
                          required
                        />
                      </div>
                    </div>

                    {/* Botón Continuar Verde */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={transferiendo || !cuentaDestinoIdPropia || !montoPropia}
                        className="bg-[#5CB85C] hover:bg-[#4CAE4C] text-white font-medium px-8 py-2.5 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {transferiendo ? 'Procesando...' : 'Continuar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. LOGICA TABS AJENAS */}
                {tabActiva === 'AJENAS' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    
                    {/* Número de cuenta ajena y Validar */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                          Número de cuenta destino
                        </label>
                        <input
                          type="text"
                          value={cuentaDestinoNumeroAjena}
                          onChange={(e) => {
                            setCuentaDestinoNumeroAjena(e.target.value);
                            setTitularValidado('');
                            setErrorValidacion('');
                          }}
                          disabled={!cuentaOrigenId}
                          placeholder="Ej. 0110-0000-03"
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-semibold text-slate-800 disabled:opacity-60"
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <button
                          type="button"
                          onClick={validarCuentaDestino}
                          disabled={validandoDestino || !cuentaDestinoNumeroAjena || !cuentaOrigenId}
                          className="w-full py-2.5 bg-[#003B7A] hover:bg-blue-900 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5"
                        >
                          {validandoDestino ? 'Validando...' : 'VALIDAR'}
                        </button>
                      </div>
                    </div>

                    {/* Detalle Titular Validado */}
                    {titularValidado && (
                      <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        Destinatario Confirmado: {titularValidado}
                      </div>
                    )}

                    {errorValidacion && (
                      <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        {errorValidacion}
                      </div>
                    )}

                    {/* Monto a Transferir */}
                    <div>
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                        Monto a transferir
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                          Q
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={montoAjena}
                          onChange={(e) => setMontoAjena(e.target.value)}
                          disabled={!cuentaOrigenId || !titularValidado}
                          placeholder="0.00"
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-bold text-slate-800 disabled:opacity-60"
                          required
                        />
                      </div>
                    </div>

                    {/* Botón Continuar Verde */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={transferiendo || !titularValidado || !montoAjena}
                        className="bg-[#5CB85C] hover:bg-[#4CAE4C] text-white font-medium px-8 py-2.5 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {transferiendo ? 'Procesando...' : 'Continuar'}
                      </button>
                    </div>
                  </div>
                )}

              </form>

            </div>

          </div>
          
        </main>
      </div>

    </div>
  );
}

export default Transferencias;
