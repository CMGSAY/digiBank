// Beneficiarios.jsx - Gestión de Cuentas de Terceros (Estilo Corporativo Claro)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Users, UserPlus, Trash2, Landmark, CheckCircle, AlertCircle } from 'lucide-react';
import { obtenerBeneficiarios, agregarBeneficiario, eliminarBeneficiario } from '../../services/beneficiario.service';

function Beneficiarios() {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [alias, setAlias] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [banco, setBanco] = useState('DigiBank');
  const [exito, setExito] = useState(null);
  const [error, setError] = useState(null);

  // Cargar beneficiarios del backend al iniciar
  const cargarBeneficiarios = async () => {
    try {
      setError(null);
      const res = await obtenerBeneficiarios();
      if (res && res.success) {
        setBeneficiarios(res.data);
      }
    } catch (err) {
      console.error('Error al cargar beneficiarios:', err);
      setError('No se pudieron consultar los beneficiarios desde el servidor.');
    }
  };

  useEffect(() => {
    cargarBeneficiarios();
  }, []);

  const handleAgregarBeneficiario = async (e) => {
    e.preventDefault();
    setExito(null);
    setError(null);

    if (numeroCuenta.length !== 10 || isNaN(numeroCuenta)) {
      setError('El número de cuenta debe tener exactamente 10 dígitos numéricos.');
      return;
    }

    try {
      const payload = {
        alias: alias.trim(),
        numeroCuenta: numeroCuenta.trim()
      };

      const res = await agregarBeneficiario(payload);
      if (res && res.success) {
        setExito('✓ Beneficiario registrado con éxito.');
        setAlias('');
        setNumeroCuenta('');
        await cargarBeneficiarios();
      } else {
        setError(res.error?.message || 'Error al registrar beneficiario.');
      }
    } catch (err) {
      console.error('Error en agregarBeneficiario:', err);
      setError(err.response?.data?.error?.message || 'Error de red al registrar beneficiario.');
    }
  };

  const handleEliminarBeneficiario = async (id) => {
    setExito(null);
    setError(null);
    try {
      const res = await eliminarBeneficiario(id);
      if (res && res.success) {
        setExito('✓ Beneficiario removido.');
        await cargarBeneficiarios();
      } else {
        setError(res.error?.message || 'Error al remover beneficiario.');
      }
    } catch (err) {
      console.error('Error en eliminarBeneficiario:', err);
      setError(err.response?.data?.error?.message || 'Error de red al remover beneficiario.');
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Navbar */}
        <Navbar titulo="Cuentas de Terceros" />

        {/* Content Body */}
        <main className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto">
          
          {/* Alertas */}
          {exito && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-sm shadow-sm">
              <CheckCircle className="w-5 h-5 shrink-0" /> <span>{exito}</span>
            </div>
          )}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-sm shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulario Adición */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 lg:col-span-1">
              <h3 className="text-lg font-bold text-[#003B7A] flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Registrar Cuenta Tercero
              </h3>

              <form onSubmit={handleAgregarBeneficiario} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alias / Nombre</label>
                  <input 
                    type="text"
                    value={alias}
                    onChange={e => setAlias(e.target.value)}
                    placeholder="Ej. Colegiatura Hijos"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Cuenta</label>
                  <input 
                    type="text"
                    value={numeroCuenta}
                    onChange={e => setNumeroCuenta(e.target.value)}
                    placeholder="10 dígitos de cuenta"
                    maxLength={10}
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Banco Destino</label>
                  <select 
                    value={banco}
                    onChange={e => setBanco(e.target.value)}
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                  >
                    <option value="DigiBank">DigiBank (Transferencia Interna)</option>
                    <option value="Banco Industrial">Banco Industrial (ACH)</option>
                    <option value="Banco G&T Continental">Banco G&T Continental (ACH)</option>
                    <option value="Banrural">Banrural (ACH)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#22C55E] hover:bg-green-600 text-white rounded-full font-bold transition-all shadow-md mt-4"
                >
                  Registrar Tercero
                </button>
              </form>
            </div>

            {/* Listado de Beneficiarios */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" /> Beneficiarios Registrados
              </h3>

              {beneficiarios.length === 0 ? (
                <div className="h-full min-h-[250px] border border-slate-200 border-dashed rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Landmark className="w-16 h-16 mb-4 opacity-50" />
                  <h4 className="font-bold text-lg text-slate-700">Sin Beneficiarios</h4>
                  <p className="max-w-xs text-sm mt-1">Registra cuentas frecuentes de terceros para transferir de manera inmediata.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beneficiarios.map(b => (
                    <div 
                      key={b.id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex justify-between items-start"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] bg-blue-50 text-[#003B7A] px-2 py-0.5 rounded font-bold uppercase border border-blue-100">{b.moneda ? 'DigiBank' : 'ACH'}</span>
                        <h4 className="text-base font-bold text-slate-800">{b.alias}</h4>
                        <p className="font-mono text-xs text-slate-400 tracking-wider">
                          {b.numeroCuenta.replace(/(\d{4})(\d{4})(\d{2})/, '$1-$2-$3')}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleEliminarBeneficiario(b.id)}
                        className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Beneficiarios;
