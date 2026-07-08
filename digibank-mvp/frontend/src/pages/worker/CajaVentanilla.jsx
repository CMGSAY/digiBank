// CajaVentanilla.jsx - Operaciones de Caja Ventanilla (Estilo Corporativo Premium)

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, Wallet, PlusCircle, MinusCircle, CheckCircle, 
  AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';

function CajaVentanilla() {
  const { usuario } = useAuth();
  const [busquedaCuenta, setBusquedaCuenta] = useState('');
  const [cuentaCliente, setCuentaCliente] = useState(null);
  const [errorCaja, setErrorCaja] = useState('');
  const [exitoCaja, setExitoCaja] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState('DEPOSITO');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);

  const buscarCliente = async (e) => {
    if (e) e.preventDefault();
    if (!busquedaCuenta.trim()) return;
    setErrorCaja('');
    setExitoCaja('');
    setCuentaCliente(null);

    try {
      setCargando(true);
      const res = await axiosInstance.get(`/worker/cuentas/${busquedaCuenta.trim()}`);
      if (res.data && res.data.success) {
        setCuentaCliente(res.data.data);
      }
    } catch (err) {
      setErrorCaja(err.response?.data?.error?.message || 'No se encontró la cuenta ingresada.');
    } finally {
      setCargando(false);
    }
  };

  const ejecutarOperacionCaja = async (e) => {
    e.preventDefault();
    if (!cuentaCliente || !monto || parseFloat(monto) <= 0) return;

    setErrorCaja('');
    setExitoCaja('');

    try {
      setCargando(true);
      const res = await axiosInstance.post('/worker/caja/operacion', {
        id_cuenta: cuentaCliente.id_cuenta,
        tipo: tipoOperacion,
        monto: parseFloat(monto),
        descripcion
      });

      if (res.data && res.data.success) {
        setExitoCaja(`¡Operación de ${tipoOperacion === 'DEPOSITO' ? 'Depósito' : 'Retiro'} completada exitosamente! Referencia: ${res.data.data.numero_referencia}`);
        setMonto('');
        setDescripcion('');
        buscarCliente();
      }
    } catch (err) {
      setErrorCaja(err.response?.data?.error?.message || 'Error al procesar la operación de caja.');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoCuenta = async (idCuenta, estadoActual) => {
    const nuevoEstado = estadoActual === 'ACTIVA' ? 'BLOQUEADA' : 'ACTIVA';
    try {
      const res = await axiosInstance.put(`/worker/cuentas/${idCuenta}/estado`, {
        estado: nuevoEstado
      });
      if (res.data && res.data.success) {
        buscarCliente();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al cambiar el estado de la cuenta.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-5xl mx-auto w-full pb-10 space-y-6">
            
            <div>
              <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Operaciones de Caja (Ventanilla)</h1>
              <p className="text-sm text-slate-500 mt-1">Realizar depósitos y retiros de efectivo para clientes bancarios</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#003B7A] uppercase tracking-wider">Buscar Cuenta del Cliente</h3>
              <form onSubmit={buscarCliente} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Ingrese número de cuenta (ej. 0110000001)"
                    value={busquedaCuenta}
                    onChange={(e) => setBusquedaCuenta(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-8 py-2.5 bg-[#00A4E0] hover:bg-[#008BBF] text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50 w-full sm:w-auto"
                >
                  {cargando ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {errorCaja && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorCaja}</span>
                </div>
              )}
              {exitoCaja && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-xl flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{exitoCaja}</span>
                </div>
              )}
            </div>

            {cuentaCliente && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#003B7A] uppercase tracking-wider border-b border-slate-100 pb-2">Información del Titular</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs block">Cliente</span>
                      <span className="font-bold text-slate-800">{cuentaCliente.nombres} {cuentaCliente.apellidos}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Email</span>
                      <span className="font-semibold text-slate-700 break-all">{cuentaCliente.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Número de Cuenta</span>
                      <span className="font-mono font-bold text-[#003B7A]">{cuentaCliente.numero_cuenta}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Tipo de Cuenta</span>
                      <span className="font-bold text-slate-650 uppercase text-xs bg-slate-100 px-2 py-0.5 rounded">{cuentaCliente.tipo_cuenta}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Estado de Cuenta</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                          cuentaCliente.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>{cuentaCliente.estado}</span>
                        <button
                          onClick={() => cambiarEstadoCuenta(cuentaCliente.id_cuenta, cuentaCliente.estado)}
                          className="text-slate-500 hover:text-[#00A4E0] transition-colors"
                          title={cuentaCliente.estado === 'ACTIVA' ? 'Bloquear cuenta' : 'Activar cuenta'}
                        >
                          {cuentaCliente.estado === 'ACTIVA' ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-slate-400 text-xs block">Saldo Disponible</span>
                      <span className="text-2xl font-extrabold text-[#003B7A] font-mono">
                        {cuentaCliente.simbolo} {parseFloat(cuentaCliente.saldo).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#003B7A] uppercase tracking-wider border-b border-slate-100 pb-2">Registrar Transacción de Caja</h4>
                  <form onSubmit={ejecutarOperacionCaja} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setTipoOperacion('DEPOSITO')}
                        className={`py-3 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          tipoOperacion === 'DEPOSITO' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <PlusCircle className="w-4 h-4" /> Depósito
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoOperacion('RETIRO')}
                        className={`py-3 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          tipoOperacion === 'RETIRO' 
                            ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <MinusCircle className="w-4 h-4" /> Retiro
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 text-xs font-semibold block">Monto ({cuentaCliente.simbolo})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] font-mono text-base font-bold text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 text-xs font-semibold block">Descripción o Concepto</label>
                      <input
                        type="text"
                        placeholder="Concepto de la operación..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={cargando || cuentaCliente.estado !== 'ACTIVA'}
                      className={`w-full py-3 text-white font-bold rounded-xl shadow transition-all text-sm ${
                        tipoOperacion === 'DEPOSITO' ? 'bg-[#5CB85C] hover:bg-[#4CAE4C]' : 'bg-rose-600 hover:bg-rose-700'
                      } disabled:opacity-50`}
                    >
                      {cargando ? 'Procesando...' : `Ejecutar ${tipoOperacion === 'DEPOSITO' ? 'Depósito' : 'Retiro'}`}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default CajaVentanilla;
