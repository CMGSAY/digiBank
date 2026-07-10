// FinanzasPersonales.jsx - Módulo de Control de Presupuesto y Finanzas Personales (Estilo Corporativo Claro)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

// Servicios de Conexión
import { obtenerPresupuesto, guardarLimites } from '../../services/presupuesto.service';

// Gráficos y Visualización Local
import { BarChart as RechartsBarChart, Bar, Cell, ResponsiveContainer, LabelList, Tooltip } from 'recharts';

// Iconografía
import { 
  Utensils, 
  ShoppingBag, 
  Send, 
  AlertTriangle, 
  Lightbulb, 
  PieChart as PieIcon, 
  Settings, 
  Sparkles, 
  Info,
  Clock,
  CheckCircle
} from 'lucide-react';

// Mapa para convertir string de icono proveniente de la BD a componente Lucide
const MAPA_ICONOS = {
  Utensils: Utensils,
  ShoppingBag: ShoppingBag,
  Send: Send,
  Sparkles: Sparkles
};

function FinanzasPersonales() {
  // Pestaña activa ('gastos', 'personalizar', 'novedades', 'analisis')
  const [activeTab, setActiveTab] = useState('gastos');

  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  const cargarDatosPresupuesto = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await obtenerPresupuesto();
      
      if (res && res.success) {
        // Mapear los iconos de string a componente funcional
        const mapped = res.data.categorias.map(cat => ({
          ...cat,
          icono: MAPA_ICONOS[cat.icono] || Info
        }));
        setCategorias(mapped);
      } else {
        setError('No se pudo recuperar el presupuesto del usuario.');
      }
    } catch (err) {
      console.error('Error al cargar presupuesto:', err);
      setError('Error de comunicación con el servidor al cargar finanzas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosPresupuesto();
  }, []);

  // Sumar el total gastado dinámicamente
  const totalGastado = categorias.reduce((sum, item) => sum + item.gastado, 0);
  const totalLimite = categorias.reduce((sum, item) => sum + item.limite, 0);
  const porcentajeTotal = totalLimite > 0 ? Math.min(100, Math.round((totalGastado / totalLimite) * 100)) : 0;

  // Datos de categorías con más gasto para el gráfico de recharts
  const chartData = categorias
    .map(c => ({
      name: c.nombre.split(' ')[0], // Nombre corto para la etiqueta
      value: c.gastado,
      color: c.color
    }))
    .sort((a, b) => b.value - a.value);

  // Manejar el cambio de límites en el estado local temporal
  const handleLimitesChange = (id, nuevoLimite) => {
    setCategorias(categorias.map(c => 
      c.id === id ? { ...c, limite: Math.max(0, parseFloat(nuevoLimite) || 0) } : c
    ));
  };

  // Guardar límites modificados en el servidor local (MongoDB)
  const handleGuardarPresupuesto = async () => {
    try {
      setGuardando(true);
      setError(null);
      setExito(null);

      // Re-mapear al formato plano requerido por el backend
      const payload = categorias.map(c => ({
        nombre: c.nombre,
        limite: parseFloat(c.limite) || 0
      }));

      const res = await guardarLimites(payload);
      if (res && res.success) {
        setExito('✓ Límites de presupuesto actualizados con éxito.');
        // Recargar datos para refrescar totales y progresos
        await cargarDatosPresupuesto();
      } else {
        setError('Error al actualizar los límites.');
      }
    } catch (err) {
      console.error('Error al guardar límites:', err);
      setError(err.response?.data?.error?.message || 'Error de red al actualizar límites.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando && categorias.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-[#003B7A] font-bold text-lg animate-pulse">Cargando presupuesto transaccional...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Navbar */}
        <Navbar titulo="Control de Presupuesto" />

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto pb-12">
          
          {/* Banner Superior Cyan */}
          <div className="bg-[#00A4E0] text-white p-6 rounded-b-3xl shadow-sm space-y-2 max-w-4xl mx-auto w-full md:mt-2">
            <h2 className="text-xl font-bold tracking-tight">Entiende mejor tu Presupuesto</h2>
            <p className="text-xs text-blue-100 font-semibold">Toma el control de tus consumos financieros del mes</p>
          </div>

          {/* Menú de Pestañas (Tabs) */}
          <div className="max-w-4xl mx-auto w-full px-4 mt-6">
            <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-xl shadow-sm gap-1">
              {[
                { id: 'gastos', label: 'Mis gastos' },
                { id: 'personalizar', label: 'Personalizar' },
                { id: 'novedades', label: 'Novedades' },
                { id: 'analisis', label: 'Análisis' }
              ].map(tab => {
                const esActivo = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError(null);
                      setExito(null);
                    }}
                    className={`flex-1 text-center py-2 px-3 text-xs font-bold transition-all ${
                      esActivo
                        ? 'bg-[#003B7A] text-white rounded-lg shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VISTAS CONDICIONALES */}
          <div className="max-w-4xl mx-auto w-full px-4 mt-6">
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {exito && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {exito}
              </div>
            )}

            {/* PESTAÑA: MIS GASTOS */}
            {activeTab === 'gastos' && (
              <div className="space-y-6">
                
                {/* Tarjeta de Gasto Total */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Llevas gastado en el mes de julio:</p>
                    <h3 className="text-3xl font-extrabold text-[#003B7A] tracking-tight">
                      GTQ {totalGastado.toFixed(2)}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      De un presupuesto total mensual asignado de GTQ {totalLimite.toFixed(2)} ({porcentajeTotal}% consumido).
                    </p>
                  </div>

                  {/* SVG Ilustrativo en el Centro (Anillo de Progreso Donut) */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Fondo */}
                      <circle
                        className="text-slate-100"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="38"
                        cx="50"
                        cy="50"
                      />
                      {/* Progreso Relleno */}
                      <circle
                        className="text-[#00A4E0] transition-all duration-500"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - porcentajeTotal / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="38"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold text-slate-700">{porcentajeTotal}%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">USADO</span>
                    </div>
                  </div>
                </div>

                {/* Detalle por Categoría */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                    Desglose por Categorías de Consumo
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorias.map(c => {
                      const IconoComponente = c.icono;
                      const porcentajeItem = c.limite > 0 ? Math.round((c.gastado / c.limite) * 100) : 0;
                      const esAlerta = porcentajeItem >= 80;

                      return (
                        <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${esAlerta ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-[#00A4E0]'}`}>
                                <IconoComponente className="w-5 h-5 shrink-0" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800 leading-tight">{c.nombre}</h5>
                                <p className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                                  GTQ {c.gastado.toFixed(2)} de GTQ {c.limite.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {esAlerta && (
                              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-1.5 rounded-lg flex items-center gap-1 text-[9px] font-extrabold uppercase animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" /> Límite Crítico
                              </div>
                            )}
                          </div>

                          {/* Barras de Progreso Nativas */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 rounded-full ${
                                  esAlerta ? 'bg-red-500' : 'bg-[#00A4E0]'
                                }`}
                                style={{ width: `${Math.min(100, porcentajeItem)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Consumo: {porcentajeItem}%</span>
                              <span>Restan: GTQ {Math.max(0, c.limite - c.gastado).toFixed(2)}</span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* PESTAÑA: PERSONALIZAR LÍMITES */}
            {activeTab === 'personalizar' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-[#003B7A] flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[#00A4E0]" /> Configurar Límites de Gasto
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Ajusta el monto máximo que deseas destinar a cada categoría de tu presupuesto mensual.</p>
                  </div>
                  <button
                    onClick={handleGuardarPresupuesto}
                    disabled={guardando}
                    className="px-5 py-2.5 bg-[#00A4E0] hover:bg-[#008BBF] text-white text-xs font-bold rounded-lg transition-all shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed shrink-0"
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

                <div className="space-y-4">
                  {categorias.map(c => {
                    const IconoComponente = c.icono;
                    return (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-55 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-[#00A4E0] rounded-lg">
                            <IconoComponente className="w-4 h-4 shrink-0" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 text-sm">{c.nombre}</span>
                            <p className="text-[10px] text-slate-400 font-semibold">Gasto actual registrado: GTQ {c.gastado.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Límite: GTQ</span>
                          <input
                            type="number"
                            value={c.limite}
                            onChange={(e) => handleLimitesChange(c.id, e.target.value)}
                            className="w-28 border border-slate-300 px-3 py-1.5 rounded-lg outline-none text-slate-700 text-sm font-semibold focus:ring-2 focus:ring-[#00A4E0]"
                            min={0}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PESTAÑA: NOVEDADES */}
            {activeTab === 'novedades' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#003B7A] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Consejos Financieros y Novedades
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="border border-slate-200 p-4 rounded-xl space-y-2 hover:shadow-md transition-shadow">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[9px] uppercase">Ahorro inteligente</span>
                      <h4 className="font-bold text-sm text-slate-800">Regla del 50/30/20</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Divide tus ingresos: destina 50% a necesidades básicas, 30% a gastos personales y reserva el 20% exclusivamente para tu cuenta de ahorro.
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl space-y-2 hover:shadow-md transition-shadow">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-[9px] uppercase">Gestión de mora</span>
                      <h4 className="font-bold text-sm text-slate-800">Recargos en Préstamos</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Recuerda efectuar tus cuotas antes de la fecha límite para evitar el recargo por mora del 5%. Activa alertas de vencimiento en tu panel.
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl space-y-2 hover:shadow-md transition-shadow">
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[9px] uppercase">Divisas en línea</span>
                      <h4 className="font-bold text-sm text-slate-800">Operaciones Virtuales</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Las cotizaciones de Dólar o Euro realizadas desde la Banca Virtual manejan spreads mucho más competitivos que el cambio físico de ventanilla.
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl space-y-2 hover:shadow-md transition-shadow">
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold text-[9px] uppercase">Salud financiera</span>
                      <h4 className="font-bold text-sm text-slate-800">Evita los Gastos Hormiga</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Pequeñas suscripciones mensuales a apps que no utilizas representan una fuga importante en tu presupuesto mensual. ¡Revisa tu historial!
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: ANÁLISIS DE GASTOS */}
            {activeTab === 'analisis' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-[#003B7A] flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-[#00A4E0]" /> Análisis Gráfico de Consumo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Visualización de tus principales consumos acumulados durante el mes de julio.</p>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 rounded-md">
                    <Clock className="w-3.5 h-3.5" /> Julio 2026
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">En julio, tus categorías con más gasto fueron:</h4>

                  {/* Gráfico de Barras Simple de Recharts */}
                  <div className="h-64 w-full bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={chartData}
                        margin={{ top: 25, right: 10, left: 10, bottom: 5 }}
                        barSize={32}
                      >
                        {/* Tooltip de Gasto */}
                        <Tooltip 
                          formatter={(value) => [`GTQ ${value.toFixed(2)}`, 'Gasto Acumulado']} 
                          labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        />

                        {/* Barras con Colores Diferenciados */}
                        <Bar 
                          dataKey="value" 
                          radius={[8, 8, 0, 0]}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}

                          {/* Valores numéricos arriba de las barras */}
                          <LabelList 
                            dataKey="value" 
                            position="top" 
                            formatter={(v) => `Q ${v.toFixed(2)}`}
                            style={{ fill: '#475569', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}
                          />
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resumen Leyendas del Gráfico */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {categorias.map(c => (
                    <div key={c.id} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default FinanzasPersonales;
