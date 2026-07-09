import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, RefreshCw } from 'lucide-react';

function Notificaciones() {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      const res = await axiosInstance.get('/notificaciones');
      if (res.data && res.data.success) {
        setNotificaciones(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const marcarComoLeida = async (id) => {
    try {
      const res = await axiosInstance.put(`/notificaciones/${id}/leido`);
      if (res.data && res.data.success) {
        // Actualizar estado local
        setNotificaciones(prev => prev.map(n => n._id === id ? { ...n, leido: true } : n));
      }
    } catch (err) {
      console.error('Error al marcar leída:', err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const res = await axiosInstance.put('/notificaciones/leido-todas');
      if (res.data && res.data.success) {
        setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
      }
    } catch (err) {
      console.error('Error al marcar todas leídas:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden bg-white">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-white">
          <div className="max-w-4xl mx-auto w-full pb-10 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight flex items-center gap-2">
                  <Bell className="w-6 h-6 text-[#00A4E0]" /> Centro de Notificaciones
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Mantente enterado de asignaciones de préstamos y resoluciones en tiempo real
                </p>
              </div>
              <div className="flex gap-2">
                {notificaciones.some(n => !n.leido) && (
                  <button 
                    onClick={marcarTodasComoLeidas}
                    className="px-4 py-2 bg-[#003B7A] hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Marcar todas como leídas
                  </button>
                )}
                <button 
                  onClick={cargarNotificaciones}
                  disabled={cargando}
                  className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-[#003B7A] shadow-sm transition-all disabled:opacity-50"
                  title="Actualizar"
                >
                  <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {cargando ? (
                <div className="text-slate-400 text-sm p-12 text-center italic animate-pulse">
                  Cargando tus notificaciones...
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="text-slate-400 text-sm p-12 text-center italic flex flex-col items-center gap-2">
                  <Bell className="w-12 h-12 text-slate-300" />
                  <span>No tienes notificaciones registradas.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notificaciones.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-5 transition-colors flex items-start gap-4 justify-between ${
                        n.leido ? 'bg-white' : 'bg-blue-50/40 hover:bg-blue-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          n.leido ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold ${n.leido ? 'text-slate-700' : 'text-[#003B7A]'}`}>
                            {n.titulo}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {n.mensaje}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {new Date(n.fecha).toLocaleDateString()} {new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      {!n.leido && (
                        <button
                          onClick={() => marcarComoLeida(n._id)}
                          className="p-1.5 hover:bg-blue-100/50 rounded-lg text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
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

export default Notificaciones;
