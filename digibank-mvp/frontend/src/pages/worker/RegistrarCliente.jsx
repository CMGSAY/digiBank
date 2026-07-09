// RegistrarCliente.jsx - Registro de Nuevo Asociado Bancario (Estilo Corporativo Premium)

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ModalAlerta from '../../components/ModalAlerta';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

function RegistrarCliente() {
  const { usuario } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [dpi, setDpi] = useState('');
  const [montoApertura, setMontoApertura] = useState('');
  const [password, setPassword] = useState('');
  const [moneda, setMoneda] = useState('GTQ');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  // Estado de modal de alerta
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

  const registrarAsociado = async (e) => {
    e.preventDefault();
    if (!nombre || !apellido || !email || !dpi || !montoApertura || !password || !moneda) {
      const msg = 'Todos los campos son obligatorios.';
      setError(msg);
      abrirModal('Error de Registro', msg, 'error');
      return;
    }
    setError('');
    setExito('');

    try {
      setCargando(true);
      const res = await axiosInstance.post('/worker/clientes/crear', {
        nombres: nombre,
        apellidos: apellido,
        email: email,
        dpi: dpi,
        password: password,
        moneda: moneda,
        monto_apertura: parseFloat(montoApertura)
      });

      if (res.data && res.data.success) {
        const data = res.data.data;
        const currencySymbol = data.cuenta.moneda === 'USD' ? '$' : 'Q';
        const msg = `¡Asociado registrado con éxito! Cuenta correlativa creada: ${data.cuenta.numero_cuenta} (${data.cuenta.moneda}) con saldo inicial ${currencySymbol} ${parseFloat(data.cuenta.saldo).toLocaleString('es-GT', { minimumFractionDigits: 2 })}.`;
        setExito(msg);
        abrirModal('Registro de Asociado Exitoso', msg, 'success');
        setNombre('');
        setApellido('');
        setEmail('');
        setDpi('');
        setMontoApertura('');
        setPassword('');
        setMoneda('GTQ');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Error al crear el asociado.';
      setError(msg);
      abrirModal('Error de Registro', `No se pudo registrar el asociado:\n\n${msg}`, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-xl mx-auto w-full pb-10 space-y-6">
            
            <div>
              <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Registrar Nuevo Asociado</h1>
              <p className="text-sm text-slate-500 mt-1">Registrar un nuevo asociado al banco y abrirle su cuenta monetaria inicial</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserPlus className="w-5 h-5 text-[#003B7A]" />
                <h3 className="text-sm font-bold text-[#003B7A] uppercase tracking-wider">Formulario de Afiliación de Asociado</h3>
              </div>

              <form onSubmit={registrarAsociado} className="space-y-4">
                {error && (
                  <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {exito && (
                  <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-xl flex items-center gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{exito}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Nombres</label>
                    <input
                      type="text"
                      placeholder="Nombres del titular"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Apellidos</label>
                    <input
                      type="text"
                      placeholder="Apellidos del titular"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Documento de Identificación (DPI)</label>
                    <input
                      type="text"
                      placeholder="Número de DPI"
                      value={dpi}
                      onChange={(e) => setDpi(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-slate-700 text-xs font-semibold block">Moneda de Apertura</label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                    >
                      <option value="GTQ">Quetzales (GTQ)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-slate-700 text-xs font-semibold block">Monto de Apertura (Depósito Inicial)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={montoApertura}
                      onChange={(e) => setMontoApertura(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 text-xs font-semibold block">Contraseña Genérica (Deberá cambiarla al ingresar)</label>
                  <input
                    type="password"
                    placeholder="Contraseña genérica inicial"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                  <strong>Aviso de Seguridad:</strong> El nuevo asociado se creará en estado ACTIVO y su número de cuenta será generado correlativamente según el orden de creación del banco. La contraseña registrada requerirá ser restablecida al primer inicio de sesión del cliente.
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3 bg-[#003B7A] hover:bg-blue-900 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  {cargando ? 'Procesando...' : 'Registrar Asociado y Abrir Cuenta'}
                </button>
              </form>
            </div>

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

export default RegistrarCliente;
