// PanelSoporte.jsx - Módulo en Desarrollo para Soporte Técnico de DigiBank MVP

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, Settings } from 'lucide-react';

function PanelSoporte() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-12 rounded-[2rem] border border-slate-200 shadow-xl max-w-md w-full text-center space-y-8 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Landmark className="text-[#003B7A] w-10 h-10" />
          <span className="text-2xl font-extrabold text-[#003B7A]">DigiBank</span>
        </div>
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#003B7A] flex items-center justify-center border border-blue-100">
          <Settings className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Módulo de Soporte</h3>
          <h4 className="text-sm font-semibold text-[#00A4E0] uppercase tracking-wider">Atención de Tickets y Dudas</h4>
          <p className="text-slate-400 text-sm leading-relaxed mt-2">
            Esta pantalla se encuentra en etapa de diseño y construcción para la siguiente fase operativa de DigiBank.
          </p>
        </div>
        <button 
          onClick={() => navigate('/banca/resumen')}
          className="px-6 py-3.5 bg-[#003B7A] hover:bg-blue-900 text-white rounded-full font-bold flex items-center gap-2 shadow-md w-full justify-center transition-colors text-sm"
        >
          <ArrowLeft className="w-5 h-5" /> Regresar al Resumen
        </button>
      </div>
    </div>
  );
}

export default PanelSoporte;
