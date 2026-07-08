// AsignarPrestamos.jsx - Asignación de Solicitudes de Préstamos Mayores (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { FileText, Send, RefreshCw } from 'lucide-react';

function AsignarPrestamos() {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [empleadoAsignado, setEmpleadoAsignado] = useState({});

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resSol = await axiosInstance.get('/admin/prestamos/mayores');
      if (resSol.data && resSol.data.success) {
        setSolicitudes(resSol.data.data);
      }
      const resPers = await axiosInstance.get('/admin/personal');
      if (resPers.data && resPers.data.success) {
        setPersonal(resPers.data.data);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const asignarSolicitud = async (idPrestamo) => {
    const empleadoId = empleadoAsignado[idPrestamo];
    if (!empleadoId) {
      alert('Por favor seleccione un empleado de la lista.');
      return;
    }

    try {
      const res = await axiosInstance.put(`/admin/prestamos/${idPrestamo}/asignar`, {
        id_empleado: parseInt(empleadoId)
      });
      if (res.data && res.data.success) {
        cargarDatos();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al asignar la solicitud.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-5xl mx-auto w-full pb-10 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Asignación de Préstamos Mayores (&gt; Q3,000)</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Derivar solicitudes de crédito que exceden el límite automático a un agente revisor
                </p>
              </div>
              <button 
                onClick={cargarDatos}
                className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-[#003B7A] shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {cargando ? (
                <div className="text-slate-400 text-sm p-12 text-center italic animate-pulse">Cargando solicitudes...</div>
              ) : solicitudes.length === 0 ? (
                <div className="text-slate-400 text-sm p-12 text-center italic">No hay solicitudes pendientes de asignación.</div>
              ) : (
                <div className="space-y-6">
                  {solicitudes.map((sol) => (
                    <div key={sol.id_prestamo} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Titular Solicitante</span>
                          <span className="font-bold text-slate-800">{sol.nombres} {sol.apellidos} ({sol.email})</span>
                        </div>
                        <span className="text-lg font-black text-[#003B7A] font-mono">{sol.simbolo} {parseFloat(sol.monto_solicitado).toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-650">
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase">Cuenta Desembolso</span>
                          <span className="font-semibold text-slate-700 font-mono">{sol.numero_cuenta}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase">Ingresos Mensuales</span>
                          <span className="font-semibold text-slate-750 font-mono">{sol.simbolo} {parseFloat(sol.ingresos_declarados).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase">Fecha Solicitud</span>
                          <span className="font-semibold text-slate-750">{new Date(sol.fecha_solicitud).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 items-end justify-between pt-3 border-t border-slate-200">
                        <div className="space-y-1 w-full md:max-w-xs">
                          <label className="text-slate-650 text-xs font-semibold block">Asignar Empleado para Aprobación</label>
                          <select
                            value={empleadoAsignado[sol.id_prestamo] || ''}
                            onChange={(e) => setEmpleadoAsignado({ ...empleadoAsignado, [sol.id_prestamo]: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-xs font-semibold text-slate-700"
                          >
                            <option value="">-- Seleccionar Revisor --</option>
                            {personal
                              .filter(p => p.rol === 'TRABAJADOR_OPERACIONES' || p.rol === 'EMPLEADO')
                              .map(p => (
                                <option key={p.id_usuario} value={p.id_usuario}>{p.nombres} {p.apellidos}</option>
                              ))
                            }
                          </select>
                        </div>

                        <button
                          onClick={() => asignarSolicitud(sol.id_prestamo)}
                          disabled={!empleadoAsignado[sol.id_prestamo]}
                          className="px-6 py-2.5 bg-[#003B7A] hover:bg-blue-900 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar Solicitud a Revisor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AsignarPrestamos;
