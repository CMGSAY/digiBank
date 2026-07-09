import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

function ModalAlerta({ isOpen, onClose, title, content, type = 'success' }) {
  if (!isOpen) return null;

  // Elegir ícono y colores según el tipo
  let Icon = Info;
  let iconColor = 'text-blue-500';
  let bgColor = 'bg-blue-50';
  let buttonColor = 'bg-[#003B7A] hover:bg-blue-900';

  if (type === 'success') {
    Icon = CheckCircle2;
    iconColor = 'text-emerald-500';
    bgColor = 'bg-emerald-50';
    buttonColor = 'bg-emerald-600 hover:bg-emerald-700';
  } else if (type === 'error') {
    Icon = XCircle;
    iconColor = 'text-rose-500';
    bgColor = 'bg-rose-50';
    buttonColor = 'bg-rose-600 hover:bg-rose-700';
  } else if (type === 'warning') {
    Icon = AlertTriangle;
    iconColor = 'text-amber-500';
    bgColor = 'bg-amber-50';
    buttonColor = 'bg-amber-600 hover:bg-amber-700';
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 ${bgColor} rounded-full`}>
            <Icon className={`w-12 h-12 ${iconColor}`} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
        <div className="flex justify-center pt-2">
          <button 
            onClick={onClose}
            className={`px-8 py-3 text-white rounded-full font-bold text-sm transition-colors shadow-md ${buttonColor}`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalAlerta;
