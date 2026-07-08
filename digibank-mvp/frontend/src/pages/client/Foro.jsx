// Foro.jsx - Canal de Colaboración Bancario en tiempo real (Estilo Corporativo Claro)

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import axiosInstance from '../../services/axiosInstance';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

import { 
  Send,
  Users
} from 'lucide-react';

function Foro() {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. Cargar Historial Inicial de Mensajes (HTTP GET)
  const cargarHistorial = async () => {
    try {
      const res = await axiosInstance.get('/foro/mensajes');
      if (res.data && res.data.success) {
        setMensajes(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar historial del foro:', err);
    }
  };

  // 2. Conectar WebSockets y registrar Eventos
  useEffect(() => {
    cargarHistorial();

    const serverUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';

    socketRef.current = io(serverUrl, {
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Conectado al foro WebSocket.');
    });

    socketRef.current.on('mensaje_recibido', (mensaje) => {
      setMensajes(prev => [...prev, mensaje]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 3. Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  // 4. Enviar Mensaje
  const handleEnviar = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !socketRef.current) return;

    const payload = {
      id_usuario: usuario.id_usuario,
      nombre_usuario: `${usuario.nombres} ${usuario.apellidos}`,
      mensaje: nuevoMensaje.trim()
    };

    socketRef.current.emit('nuevo_mensaje', payload);
    setNuevoMensaje('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Navbar */}
        <Navbar titulo="Foro Colaborativo" />

        {/* Chat Feed Box */}
        <div className="flex-grow flex flex-col bg-slate-50 overflow-hidden">
          
          {/* Forum Info Subheader */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#003B7A] flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Foro de Asistencia Mutua</h3>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Chat en vivo activo
                </p>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div 
            ref={scrollRef}
            className="flex-grow p-6 overflow-y-auto space-y-4"
          >
            {mensajes.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-12">
                Aún no hay mensajes en el foro. ¡Sé el primero en iniciar la conversación!
              </div>
            ) : (
              mensajes.map((m, idx) => {
                const esPropio = m.id_usuario === usuario?.id_usuario;
                return (
                  <div 
                    key={m._id || idx}
                    className={`flex flex-col max-w-md ${esPropio ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-bold">{m.nombre_usuario}</span>
                    <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${
                      esPropio 
                        ? 'bg-[#003B7A] text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      <p className="break-words leading-relaxed">{m.mensaje}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Bar */}
          <footer className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form onSubmit={handleEnviar} className="flex gap-3">
              <input 
                type="text"
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje para el foro..."
                className="flex-grow bg-slate-50 border border-slate-200 px-4 py-3 rounded-full text-slate-800 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm"
                required
                maxLength={1000}
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-[#22C55E] hover:bg-green-600 text-white rounded-full font-bold flex items-center justify-center shadow-md transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </footer>

        </div>
      </div>
    </div>
  );
}

export default Foro;
