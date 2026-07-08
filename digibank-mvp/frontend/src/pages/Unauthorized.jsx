// Unauthorized.jsx - Página de Acceso Denegado de DigiBank MVP

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

function Unauthorized() {
  return (
    <div class="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
      <div class="glass-panel max-w-md w-full p-8 rounded-2xl text-center space-y-6">
        <div class="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-bold">Acceso Denegado</h2>
        <p class="text-slate-400">
          Tu rol de usuario no tiene los permisos necesarios para visualizar este panel financiero.
        </p>
        <Link to="/banca/resumen" class="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-all">
          Volver al Resumen
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
