// NotFound.jsx - Página 404 de DigiBank MVP

import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

function NotFound() {
  return (
    <div class="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
      <div class="glass-panel max-w-md w-full p-8 rounded-2xl text-center space-y-6">
        <div class="w-16 h-16 bg-slate-500/10 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <HelpCircle class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-bold">Ruta No Encontrada</h2>
        <p class="text-slate-400">
          La página solicitada no existe o ha sido movida.
        </p>
        <Link to="/" class="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-all">
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
