// Dashboard.jsx - Panel de Control Gerencial de Balances y Liquidez (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Landmark, Users, BarChart3, RefreshCw } from 'lucide-react';

function AdminDashboard() {
  const { usuario } = useAuth();
  const [kpis, setKpis] = useState({
    depositosDia: 45280.00,
    prestamosActivos: 18,
    cuentasNuevas: 12
  });
  const [liquidez, setLiquidez] = useState({
    disponibilidadesGTQ: 1250000.00,
    disponibilidadesUSD: 450000.00,
    reservaLegal: 300000.00,
    carteraCreditos: 1850000.00
  });
  const [cargando, setCargando] = useState(false);

  const cargarKpisYLiquidez = async () => {
    try {
      setCargando(true);
      const resKpi = await axiosInstance.get('/admin/dashboard/kpis');
      if (resKpi.data && resKpi.data.success) {
        setKpis(resKpi.data.data);
      }
      const resLiq = await axiosInstance.get('/admin/dashboard/liquidez');
      if (resLiq.data && resLiq.data.success) {
        setLiquidez(resLiq.data.data);
      }
    } catch (err) {
      console.error('Error al cargar KPIs y liquidez:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarKpisYLiquidez();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-5xl mx-auto w-full pb-10 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Balances y Liquidez Bancaria</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Métricas de operación del día y balances globales consolidados
                </p>
              </div>
              <button 
                onClick={cargarKpisYLiquidez}
                className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-[#003B7A] shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-[#003B7A] rounded-xl border border-blue-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Depósitos del Día</span>
                  <span className="text-xl font-extrabold text-slate-800">Q {kpis.depositosDia.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Préstamos Activos</span>
                  <span className="text-xl font-extrabold text-slate-800">{kpis.prestamosActivos} Solicitudes</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Cuentas Registradas</span>
                  <span className="text-xl font-extrabold text-slate-800">{kpis.cuentasNuevas} Activas</span>
                </div>
              </div>
            </div>

            {/* Liquidez y Reservas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-[#003B7A]">
                <BarChart3 className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Resumen de Encaje Legal y Liquidez</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-semibold">Disponibilidades Quetzales (GTQ):</span>
                    <span className="font-mono font-bold text-slate-800">Q {liquidez.disponibilidadesGTQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-semibold">Disponibilidades Dólares (USD):</span>
                    <span className="font-mono font-bold text-slate-800">$ {liquidez.disponibilidadesUSD.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-semibold">Reserva Legal Técnica:</span>
                    <span className="font-mono font-bold text-slate-800">Q {liquidez.reservaLegal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-semibold">Cartera de Créditos Aprobada:</span>
                    <span className="font-mono font-bold text-[#003B7A]">Q {liquidez.carteraCreditos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
