// HistorialCaja.jsx - Historial de Operaciones de Caja (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, RefreshCw } from 'lucide-react';

function HistorialCaja() {
  const { usuario } = useAuth();
  const [historialCaja, setHistorialCaja] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const res = await axiosInstance.get('/worker/caja/historial');
      if (res.data && res.data.success) {
        setHistorialCaja(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar historial de caja:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-5xl mx-auto w-full pb-10 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Historial de Operaciones de Caja</h1>
                <p className="text-sm text-slate-500 mt-1">Lista de depósitos y retiros registrados en este turno en MongoDB</p>
              </div>
              <button 
                onClick={cargarHistorial}
                className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-[#003B7A] shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {cargando ? (
                <div className="text-slate-400 text-sm p-12 text-center italic animate-pulse">Cargando transacciones de caja de MongoDB...</div>
              ) : historialCaja.length === 0 ? (
                <div className="text-slate-400 text-sm p-12 text-center italic">No has registrado operaciones de caja en este turno.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">Operación</th>
                        <th className="p-3">Cuenta Afectada</th>
                        <th className="p-3 text-right">Monto</th>
                        <th className="p-3">Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialCaja.map((log) => (
                        <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              log.accion === 'DEPOSITO_CAJA' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>{log.accion === 'DEPOSITO_CAJA' ? 'DEPÓSITO' : 'RETIRO'}</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-[#003B7A]">{log.detalles?.cuenta_afectada}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{log.detalles?.moneda} {parseFloat(log.detalles?.monto).toFixed(2)}</td>
                          <td className="p-3 font-mono text-xs text-slate-400">{log.detalles?.numero_referencia}</td>
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

export default HistorialCaja;
