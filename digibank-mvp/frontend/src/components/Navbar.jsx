// Navbar.jsx - Cabecera Superior con Tipo de Cambio Dinámico del Banco de Guatemala

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, Landmark } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

function Navbar() {
  const { logout } = useAuth();
  
  // Estado para el tipo de cambio del Banguat
  const [tasas, setTasas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTipoCambio = async () => {
      try {
        setCargando(true);
        const response = await axiosInstance.get('/divisas/actual');
        if (response.data && response.data.success) {
          setTasas(response.data.data);
        }
      } catch (error) {
        console.error('Error al consultar tipo de cambio en Navbar:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarTipoCambio();
  }, []);

  return (
    <header className="bg-[#0b334d] h-20 px-6 flex items-center justify-between text-white shadow-md z-10 shrink-0">
      
      {/* Izquierda: Menú y Logo */}
      <div className="flex items-center gap-6">
        <Menu className="w-7 h-7 cursor-pointer hover:text-blue-300 transition-colors" />
        <div className="flex items-center gap-2 border-l border-blue-800 pl-6">
          <Landmark className="w-8 h-8 text-white" />
          <span className="text-2xl font-extrabold tracking-widest hidden sm:block">DIGIBANK</span>
        </div>
      </div>

      {/* Centro: Tipo de Cambio del Banco de Guatemala (Dinamizado) */}
      <div className="hidden md:block text-sm font-bold tracking-wide text-cyan-400 bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-700/30">
        {cargando ? (
          <span className="text-slate-400 italic">Actualizando tasas...</span>
        ) : tasas ? (
          <span>Compra: Q. {tasas.compra.toFixed(2)} &nbsp;&nbsp;|&nbsp;&nbsp; Venta: Q. {tasas.venta.toFixed(2)}</span>
        ) : (
          <span className="text-red-400">Error al sincronizar tasas</span>
        )}
      </div>

      {/* Derecha: Salir */}
      <div className="flex items-center">
        <button 
          onClick={logout}
          className="flex items-center justify-center p-2 bg-blue-900/50 hover:bg-rose-600/80 rounded-lg transition-colors group"
          title="Cerrar Sesión"
        >
          <LogOut className="w-6 h-6 text-blue-100 group-hover:text-white" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;