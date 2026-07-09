// PrestamosAsignados.jsx - Créditos Asignados a Empleado (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { FileText, Check, X, RefreshCw } from 'lucide-react';

function PrestamosAsignados() {
  const { usuario } = useAuth();
  const [prestamosAsignados, setPrestamosAsignados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [comentariosPrestamo, setComentariosPrestamo] = useState({});

  const cargarPrestamos = async () => {
    try {
      setCargando(true);
      const res = await axiosInstance.get('/worker/prestamos/asignados');
      if (res.data && res.data.success) {
        setPrestamosAsignados(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar préstamos asignados:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const resolverPrestamo = async (idPrestamo, resolucion) => {
    const comentario = comentariosPrestamo[idPrestamo] || '';
    try {
      const res = await axiosInstance.put(`/worker/prestamos/${idPrestamo}/estado`, {
        estado: resolucion,
        comentario_revisor: comentario
      });
      if (res.data && res.data.success) {
        cargarPrestamos();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al actualizar el estado del préstamo.');
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
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Créditos Asignados para Aprobación</h1>
                <p className="text-sm text-slate-500 mt-1">Evaluar y autorizar o denegar solicitudes de préstamos asignadas por la gerencia</p>
              </div>
              <button 
                onClick={cargarPrestamos}
                className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-[#003B7A] shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {cargando ? (
                <div className="text-slate-400 text-sm p-12 text-center italic animate-pulse">Cargando solicitudes asignadas...</div>
              ) : prestamosAsignados.length === 0 ? (
                <div className="text-slate-400 text-sm p-12 text-center italic">No tienes préstamos pendientes de revisión.</div>
              ) : (
                <div className="space-y-6">
                  {prestamosAsignados.map((p) => (
                    <div key={p.id_prestamo} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Titular Solicitante</span>
                          <span className="font-bold text-slate-800">{p.nombres} {p.apellidos} ({p.email})</span>
                        </div>
                        <span className="text-lg font-black text-[#003B7A] font-mono">{p.simbolo} {parseFloat(p.monto_solicitado).toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-500 block font-semibold uppercase">Cuenta Desembolso</span>
                          <span className="font-semibold text-slate-700 font-mono">{p.numero_cuenta}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold uppercase">Ingresos Mensuales</span>
                          <span className="font-semibold text-slate-700 font-mono">{p.simbolo} {parseFloat(p.ingresos_declarados).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold uppercase">Fecha Solicitud</span>
                          <span className="font-semibold text-slate-700">{new Date(p.fecha_solicitud).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold uppercase">Estado Actual</span>
                          <span className="px-2 py-0.5 font-bold rounded bg-yellow-100 text-yellow-800 uppercase">Revisión Ventanilla</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-700 text-xs font-semibold block">Justificación o Resolución del Cajero</label>
                        <textarea
                          placeholder="Indique los motivos de la resolución..."
                          value={comentariosPrestamo[p.id_prestamo] || ''}
                          onChange={(e) => setComentariosPrestamo({ ...comentariosPrestamo, [p.id_prestamo]: e.target.value })}
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-xs resize-none h-20"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2 border-t border-slate-200">
                        <button
                          onClick={() => resolverPrestamo(p.id_prestamo, 'RECHAZADO')}
                          className="px-6 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Rechazar Préstamo
                        </button>
                        <button
                          onClick={() => resolverPrestamo(p.id_prestamo, 'APROBADO')}
                          className="px-6 py-2 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white font-bold rounded-xl transition-colors text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Aprobar Desembolso
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

export default PrestamosAsignados;
