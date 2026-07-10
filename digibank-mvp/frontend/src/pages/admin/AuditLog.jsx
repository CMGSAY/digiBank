// AuditLog.jsx - Bitácora de Auditoría (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { FileText, Search, RefreshCw, AlertCircle } from 'lucide-react';

function AuditLog() {
  const { usuario } = useAuth();
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [error, setError] = useState('');

  const cargarLogs = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axiosInstance.get('/admin/auditoria');
      if (res.data && res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      setError('Error al conectar con la bitácora de auditoría.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLogs();
  }, []);

  const logsFiltrados = logs.filter(log => {
    if (!filtroCuenta.trim()) return true;
    const cuenta = log.detalles?.cuenta_afectada || '';
    const desc = log.detalles?.descripcion || '';
    const email = log.detalles?.email || '';
    return cuenta.toLowerCase().includes(filtroCuenta.toLowerCase()) ||
           desc.toLowerCase().includes(filtroCuenta.toLowerCase()) ||
           email.toLowerCase().includes(filtroCuenta.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Panel Central */}
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-5xl mx-auto w-full pb-10 space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Bitácora de Auditoría de Seguridad</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Registros de auditoría almacenados persistentemente para cumplimiento regulatorio
                </p>
              </div>
              <button 
                onClick={cargarLogs}
                className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-[#003B7A] shadow-sm transition-all"
                title="Actualizar Bitácora"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Buscador / Filtro */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filtrar por número de cuenta, descripción o usuario..."
                value={filtroCuenta}
                onChange={(e) => setFiltroCuenta(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tabla de Logs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {cargando ? (
                <div className="text-slate-400 text-sm p-12 text-center italic animate-pulse">Consultando logs de auditoría...</div>
              ) : logsFiltrados.length === 0 ? (
                <div className="text-slate-400 text-sm p-12 text-center italic">No se encontraron registros de auditoría que coincidan con la búsqueda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Fecha y Hora</th>
                        <th className="p-4">Usuario Responsable</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4">Acción Ejecutada</th>
                        <th className="p-4">Cuenta Afectada</th>
                        <th className="p-4 text-right">Monto</th>
                        <th className="p-4">IP Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsFiltrados.map((log) => (
                        <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-4 font-bold text-slate-800">Cajero ID: {log.id_usuario}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-800">
                              {log.rol}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">{log.accion}</td>
                          <td className="p-4 font-mono text-[#003B7A] font-bold">{log.detalles?.cuenta_afectada || 'N/A'}</td>
                          <td className="p-4 text-right font-mono font-bold text-slate-700">
                            {log.detalles?.monto ? `${log.detalles.moneda || 'GTQ'} ${parseFloat(log.detalles.monto).toFixed(2)}` : '-'}
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLog;
