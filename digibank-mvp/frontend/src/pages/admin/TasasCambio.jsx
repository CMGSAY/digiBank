// TasasCambio.jsx - Configuración de Tasas de Cambio del Día (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, CheckCircle2, ShieldAlert, TrendingUp } from 'lucide-react';

function TasasCambio() {
  const { usuario } = useAuth();
  const [tasas, setTasas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [tasaCompra, setTasaCompra] = useState('');
  const [tasaVenta, setTasaVenta] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const cargarTasas = async () => {
    try {
      setCargando(true);
      const res = await axiosInstance.get('/admin/tasas');
      if (res.data && res.data.success) {
        setTasas(res.data.data);
        if (res.data.data.length > 0) {
          // Pre-llenar formulario con la primera tasa activa
          const activeRate = res.data.data.find(r => r.activo) || res.data.data[0];
          setTasaCompra(activeRate.tasa_compra.toString());
          setTasaVenta(activeRate.tasa_venta.toString());
        }
      }
    } catch (err) {
      console.error('Error al cargar tasas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTasas();
  }, []);

  const actualizarTasas = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');

    try {
      setCargando(true);
      const res = await axiosInstance.post('/admin/tasas', {
        compra: parseFloat(tasaCompra),
        venta: parseFloat(tasaVenta)
      });
      if (res.data && res.data.success) {
        setMensajeExito('¡Tasas de cambio actualizadas exitosamente en el sistema bancario!');
        cargarTasas();
      }
    } catch (err) {
      setMensajeError(err.response?.data?.error?.message || 'Error al actualizar tasas de cambio.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Panel Central */}
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-xl mx-auto w-full pb-10 space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Tasas de Cambio del Día</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Establecer la cotización oficial del Quetzal (GTQ) frente al Dólar (USD)
                </p>
              </div>
            </div>

            {/* Ficha Actual e Inputs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-[#003B7A]">
                <TrendingUp className="w-6 h-6" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Paridad GTQ / USD</h3>
              </div>

              {mensajeExito && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{mensajeExito}</span>
                </div>
              )}

              {mensajeError && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{mensajeError}</span>
                </div>
              )}

              <form onSubmit={actualizarTasas} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 text-xs font-semibold block">Tasa de Compra (Q)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder="e.g. 7.75"
                      value={tasaCompra}
                      onChange={(e) => setTasaCompra(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-bold font-mono text-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 text-xs font-semibold block">Tasa de Venta (Q)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder="e.g. 7.82"
                      value={tasaVenta}
                      onChange={(e) => setTasaVenta(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-bold font-mono text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <strong>Nota Administrativa:</strong> La actualización de estas tasas impactará en tiempo real la calculadora de divisas del Navbar y las transferencias multimoneda de todos los clientes financieros.
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3 bg-[#003B7A] hover:bg-blue-900 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : 'Actualizar Tasas de Cambio'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default TasasCambio;
