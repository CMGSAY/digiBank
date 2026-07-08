// LoadingSpinner.jsx — Indicador de carga global reutilizable de DigiBank

import React from 'react';
import { Landmark } from 'lucide-react';

/**
 * Spinner de carga con variantes: fullscreen (página completa) o inline (dentro de un contenedor).
 * @param {boolean} fullscreen - Si true, ocupa toda la pantalla. Default: false.
 * @param {string}  message    - Texto descriptivo opcional bajo el spinner.
 * @param {string}  size       - 'sm' | 'md' | 'lg'. Default: 'md'.
 */
function LoadingSpinner({ fullscreen = false, message = 'Cargando...', size = 'md' }) {
  const sizes = {
    sm: { icon: 'w-5 h-5', ring: 'w-8 h-8',  text: 'text-xs' },
    md: { icon: 'w-7 h-7', ring: 'w-14 h-14', text: 'text-sm' },
    lg: { icon: 'w-9 h-9', ring: 'w-20 h-20', text: 'text-base' }
  };

  const s = sizes[size] || sizes.md;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Anillo animado con logo DigiBank */}
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior giratorio */}
        <div
          className={`${s.ring} rounded-full border-4 border-slate-100 border-t-[#003B7A] animate-spin`}
        />
        {/* Logo centrado estático */}
        <div className="absolute flex items-center justify-center">
          <Landmark className={`${s.icon} text-[#003B7A]`} />
        </div>
      </div>

      {/* Mensaje */}
      {message && (
        <p className={`${s.text} text-slate-500 font-medium tracking-wide animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
