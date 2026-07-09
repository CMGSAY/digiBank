import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axiosInstance from '../services/axiosInstance';
import ModalAlerta from '../components/ModalAlerta';
import { Lock, ShieldCheck } from 'lucide-react';

function CambiarPassword() {
  const [passwordAnterior, setPasswordAnterior] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Estados de Modal de Alerta
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState('success');

  const abrirModal = (titulo, contenido, tipo = 'success') => {
    setModalTitle(titulo);
    setModalContent(contenido);
    setModalType(tipo);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordAnterior || !passwordNuevo || !passwordConfirmar) {
      abrirModal('Campos Incompletos', 'Por favor completa todos los campos del formulario.', 'warning');
      return;
    }

    if (passwordNuevo !== passwordConfirmar) {
      abrirModal('Error de Coincidencia', 'La nueva contraseña y su confirmación no coinciden. Por favor verifica.', 'warning');
      return;
    }

    if (passwordNuevo.length < 6) {
      abrirModal('Contraseña Muy Corta', 'La nueva contraseña debe tener al menos 6 caracteres por seguridad.', 'warning');
      return;
    }

    try {
      setProcesando(true);
      const res = await axiosInstance.post('/auth/cambiar-password', {
        passwordAnterior,
        passwordNuevo,
        passwordConfirmar
      });

      if (res.data && res.data.success) {
        abrirModal('¡Éxito!', '✓ Contraseña actualizada correctamente.', 'success');
        setPasswordAnterior('');
        setPasswordNuevo('');
        setPasswordConfirmar('');
      } else {
        abrirModal('No se pudo Actualizar', res.data.error?.message || 'Error al actualizar la contraseña.', 'error');
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      abrirModal('No se pudo Actualizar', err.response?.data?.error?.message || 'Error al conectar con el servidor local.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden bg-white">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-white">
          <div className="max-w-xl mx-auto w-full pb-10 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#00A4E0]" /> Configuración de Seguridad
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Actualiza tus credenciales de acceso para proteger tu banca digital
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Lock className="w-5 h-5 text-[#00A4E0]" />
                <h3 className="text-base font-bold text-[#003B7A]">Actualizar Contraseña</h3>
              </div>

              {/* 1. Contraseña Anterior */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña Anterior</label>
                <input
                  type="password"
                  placeholder="Introduce tu clave actual"
                  value={passwordAnterior}
                  onChange={(e) => setPasswordAnterior(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                  required
                />
              </div>

              {/* 2. Nueva Contraseña */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Introduce la nueva clave (mínimo 6 caracteres)"
                  value={passwordNuevo}
                  onChange={(e) => setPasswordNuevo(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                  required
                />
              </div>

              {/* 3. Confirmar Nueva Contraseña */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Repite la nueva clave"
                  value={passwordConfirmar}
                  onChange={(e) => setPasswordConfirmar(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={procesando}
                className="w-full py-4 bg-[#003B7A] hover:bg-[#002752] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-350 disabled:cursor-not-allowed"
              >
                {procesando ? 'Actualizando...' : 'Aceptar'}
              </button>
            </form>

          </div>
        </div>
      </div>

      <ModalAlerta
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        type={modalType}
      />
    </div>
  );
}

export default CambiarPassword;
