// Prestamos.jsx - Gestión de Préstamos y Simulador Interactivo

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPrestamos } from '../../services/prestamo.service';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Calculator, Calendar, Landmark, FileText, Printer, ShieldCheck, HelpCircle } from 'lucide-react';

function Prestamos() {
  const navigate = useNavigate();

  // Estados
  const [prestamosActivos, setPrestamosActivos] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados del cotizador
  const [montoSim, setMontoSim] = useState(25000);
  const [plazoSim, setPlazoSim] = useState(24);
  const [tasaSim] = useState(12); // 12% anual fijo
  const [cuotaSim, setCuotaSim] = useState(0);
  const [amortSim, setAmortSim] = useState([]);
  const [simulado, setSimulado] = useState(false);

  // Control de pestañas
  const [tabActiva, setTabActiva] = useState('activos'); // 'activos' o 'cotizador'

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const res = await obtenerPrestamos();
      if (res && res.success) {
        setPrestamosActivos(res.data);
        if (res.data.length > 0) {
          // Por defecto seleccionar el primer préstamo aprobado
          const aprobado = res.data.find(p => p.estado === 'APROBADO');
          setPrestamoSeleccionado(aprobado || res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error al cargar préstamos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Calcular cotización simulada
  const handleCalcularSimulacion = (e) => {
    e.preventDefault();
    const P = parseFloat(montoSim);
    const r = (parseFloat(tasaSim) / 100) / 12; // mensual
    const n = parseInt(plazoSim);

    const cuota = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setCuotaSim(cuota);

    let saldo = P;
    const amort = [];
    for (let i = 1; i <= n; i++) {
      const interes = saldo * r;
      const capital = cuota - interes;
      saldo -= capital;
      amort.push({
        mes: i,
        cuota: cuota,
        interes: interes,
        capital: capital,
        saldo: Math.max(0, saldo)
      });
    }
    setAmortSim(amort);
    setSimulado(true);
  };

  // Generar tabla de amortización para préstamo real activo
  const obtenerAmortizacionReal = (p) => {
    if (!p) return [];
    const P = parseFloat(p.monto_solicitado);
    const r = 0.01; // 12% anual = 1% mensual aproximado
    const n = 12;  // Plazo base 12 meses
    const cuota = parseFloat(p.cuota_mensual);
    
    let saldo = P;
    const amort = [];
    for (let i = 1; i <= n; i++) {
      const interes = saldo * r;
      const capital = cuota - interes;
      saldo -= capital;
      
      // Detalle del saldo restante amortizado
      amort.push({
        mes: i,
        cuota: cuota,
        interes: interes,
        capital: capital,
        saldo: Math.max(0, saldo)
      });
    }
    return amort;
  };

  const amortizacionReal = obtenerAmortizacionReal(prestamoSeleccionado);

  const handlePrint = () => {
    window.print();
  };

  if (cargando) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-[#003B7A] font-bold text-lg animate-pulse">Cargando módulos de financiamiento...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Estilo Dedicado para Impresión (@media print) */}
      <style>{`
        @media print {
          /* Ocultar elementos de navegación y controles */
          aside, nav, header, button, .no-print, .tab-header, .selector-box {
            display: none !important;
          }
          
          /* Ajustar el contenedor para ocupar toda la página */
          body, .flex-grow, main, .print-sheet {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Diseño de documento plano */
          .print-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
          
          .print-header {
            display: block !important;
            border-bottom: 2px solid #003B7A !important;
            margin-bottom: 20px !important;
            padding-bottom: 10px !important;
          }

          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden bg-white">
        
        {/* Navbar */}
        <Navbar />

        {/* Content Area */}
        <main className="flex-grow p-8 bg-white text-slate-800 flex flex-col overflow-y-auto print-sheet">
          
          {/* Cabecera del Reporte para Impresión (Sólo visible en PDF/Impresión) */}
          <div className="hidden print-header">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-[#003B7A]">BANCO INDUSTRIAL, S.A.</h1>
                <p className="text-xs text-slate-500 font-mono">ESTADO DE CUENTA DE PRÉSTAMO</p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                <p>Fecha de Impresión: {new Date().toLocaleDateString('es-GT')}</p>
                <p>Autorización No. 1235467470</p>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            {/* Encabezado y Acciones Rápidas */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200 no-print">
              <div>
                <h2 className="text-2xl font-bold text-[#003B7A] tracking-tight">Financiamientos</h2>
                <p className="text-xs text-slate-500 font-semibold">Administra tus préstamos activos y cotiza nuevas opciones</p>
              </div>

              {/* Botones de acción en color Cyan y Azul corporativo */}
              <div className="flex items-center gap-2 self-stretch md:self-auto">
                <button
                  onClick={() => navigate('/banca/prestamos/solicitar')}
                  className="flex-1 md:flex-none px-5 py-2 bg-[#00A4E0] hover:bg-[#008BBF] text-white text-xs font-bold rounded-lg shadow-sm transition-all text-center"
                >
                  Solicitar Préstamo
                </button>
                <button
                  onClick={() => navigate('/banca/prestamos/pagar')}
                  className="flex-1 md:flex-none px-5 py-2 bg-[#003B7A] hover:bg-[#002752] text-white text-xs font-bold rounded-lg shadow-sm transition-all text-center"
                >
                  Pagar Cuota
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación (no-print) */}
            <div className="flex border-b border-slate-200 tab-header no-print">
              <button
                onClick={() => setTabActiva('activos')}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                  tabActiva === 'activos'
                    ? 'border-[#003B7A] text-[#003B7A]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Mis Préstamos Activos
              </button>
              <button
                onClick={() => setTabActiva('cotizador')}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                  tabActiva === 'cotizador'
                    ? 'border-[#003B7A] text-[#003B7A]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Cotizador de Préstamo
              </button>
            </div>

            {/* CONTENIDO DE PESTAÑA: PRÉSTAMOS ACTIVOS */}
            {tabActiva === 'activos' && (
              <div className="space-y-6">
                {prestamosActivos.length === 0 ? (
                  <div className="border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400 bg-slate-50 no-print">
                    <Landmark className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#003B7A]" />
                    <h3 className="text-lg font-bold text-slate-700">Aún no tienes préstamos</h3>
                    <p className="text-sm mt-1 max-w-xs mx-auto mb-4">Solicita tu línea de crédito hoy mismo y recíbela en minutos.</p>
                    <button
                      onClick={() => navigate('/banca/prestamos/solicitar')}
                      className="px-6 py-2.5 bg-[#00A4E0] hover:bg-[#008BBF] text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Crear Solicitud
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Panel Lateral: Selector y Detalles (no-print) */}
                    <div className="lg:col-span-1 space-y-4 no-print">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 selector-box">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Seleccionar Préstamo</label>
                        <select
                          value={prestamoSeleccionado?.id_prestamo || ''}
                          onChange={(e) => {
                            const p = prestamosActivos.find(x => x.id_prestamo === parseInt(e.target.value));
                            setPrestamoSeleccionado(p);
                          }}
                          className="w-full border border-slate-350 bg-white px-3 py-2.5 rounded-xl outline-none font-semibold text-slate-700 text-sm"
                        >
                          {prestamosActivos.map(p => (
                            <option key={p.id_prestamo} value={p.id_prestamo}>
                              No. {p.id_prestamo} ({p.estado})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Detalles del Préstamo Activo */}
                      {prestamoSeleccionado && (
                        <div className="bg-[#E8F8F0] border border-[#C2EAD2] rounded-2xl p-5 space-y-4 text-emerald-950">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-[#C2EAD2] pb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Resumen de Cuenta
                          </h3>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-semibold">Estado:</span>
                              <span className="font-bold uppercase">{prestamoSeleccionado.estado}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-semibold">Monto Original:</span>
                              <span className="font-bold font-mono">Q {parseFloat(prestamoSeleccionado.monto_solicitado).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-semibold">Saldo Pendiente:</span>
                              <span className="font-extrabold font-mono text-[#003B7A]">Q {parseFloat(prestamoSeleccionado.saldo_pendiente).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-semibold">Cuota Mensual:</span>
                              <span className="font-bold font-mono">Q {parseFloat(prestamoSeleccionado.cuota_mensual).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-semibold">Fecha Límite:</span>
                              <span className="font-bold">
                                {prestamoSeleccionado.fecha_limite_pago 
                                  ? new Date(prestamoSeleccionado.fecha_limite_pago).toLocaleDateString('es-GT') 
                                  : 'Liquidado'}
                              </span>
                            </div>
                          </div>

                          {/* Botón de Impresión en PDF */}
                          {prestamoSeleccionado.estado === 'APROBADO' && (
                            <button
                              onClick={handlePrint}
                              className="w-full mt-2 py-2 bg-white hover:bg-slate-50 text-[#003B7A] border border-[#003B7A] rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Printer className="w-4 h-4" /> Imprimir Estado de Préstamo
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reporte Plano de Amortización (Imprimible) */}
                    <div className="lg:col-span-2 space-y-4">
                      {prestamoSeleccionado ? (
                        <div className="bg-white border border-slate-200 rounded-none shadow-none p-5 space-y-4 print-container">
                          
                          {/* Resumen del Préstamo para el Reporte */}
                          <div className="pb-3 border-b border-slate-300">
                            <h3 className="text-[#003B7A] text-lg font-bold">Estado de Cuenta y Tabla de Amortización</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-3">
                              <div>
                                <span className="text-slate-400 block font-bold uppercase text-[9px]">Código Préstamo</span>
                                <span className="text-slate-700 font-bold font-mono">PR-{prestamoSeleccionado.id_prestamo}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-bold uppercase text-[9px]">Monto del Crédito</span>
                                <span className="text-slate-700 font-bold font-mono">Q {parseFloat(prestamoSeleccionado.monto_solicitado).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-bold uppercase text-[9px]">Saldo Pendiente</span>
                                <span className="text-[#003B7A] font-extrabold font-mono">Q {parseFloat(prestamoSeleccionado.saldo_pendiente).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-bold uppercase text-[9px]">Cuota del Mes</span>
                                <span className="text-slate-700 font-bold font-mono">Q {parseFloat(prestamoSeleccionado.cuota_mensual).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tabla de amortización real */}
                          {prestamoSeleccionado.estado === 'APROBADO' ? (
                            <div className="overflow-x-auto border border-slate-200">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-[#003B7A] text-white text-[10px] font-bold border-b border-[#002752] uppercase tracking-wider text-center">
                                    <th className="p-3 border-r border-[#002752] w-12">Mes</th>
                                    <th className="p-3 border-r border-[#002752] w-32">Cuota Esperada</th>
                                    <th className="p-3 border-r border-[#002752] w-32">Interés (1%)</th>
                                    <th className="p-3 border-r border-[#002752] w-32">Capital Amort.</th>
                                    <th className="p-3 w-32">Saldo Pendiente</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {amortizacionReal.map(row => (
                                    <tr key={row.mes} className="border-b border-slate-200 text-center hover:bg-slate-50/40">
                                      <td className="p-3 border-r border-slate-200 font-bold text-slate-500">{row.mes}</td>
                                      <td className="p-3 border-r border-slate-200">
                                        <div className="flex justify-between w-full font-mono px-2 text-slate-700">
                                          <span>Q</span>
                                          <span>{row.cuota.toFixed(2)}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 border-r border-slate-200">
                                        <div className="flex justify-between w-full font-mono px-2 text-rose-500">
                                          <span>Q</span>
                                          <span>{row.interes.toFixed(2)}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 border-r border-slate-200">
                                        <div className="flex justify-between w-full font-mono px-2 text-emerald-600">
                                          <span>Q</span>
                                          <span>{row.capital.toFixed(2)}</span>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div className="flex justify-between w-full font-mono px-2 font-bold text-slate-800">
                                          <span>Q</span>
                                          <span>{row.saldo.toFixed(2)}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 text-xs italic">
                              Este préstamo se encuentra en estado: <strong className="uppercase text-amber-600">{prestamoSeleccionado.estado}</strong> y no posee una tabla de amortización activa.
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO DE PESTAÑA: COTIZADOR */}
            {tabActiva === 'cotizador' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                {/* Formulario */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 lg:col-span-1">
                  <h3 className="text-base font-bold text-[#003B7A] flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#00A4E0]" /> Configurar Proyección
                  </h3>

                  <form onSubmit={handleCalcularSimulacion} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monto (Q)</label>
                      <input 
                        type="number"
                        value={montoSim}
                        onChange={e => setMontoSim(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                        required
                        min={100}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plazo (Meses)</label>
                      <select 
                        value={plazoSim}
                        onChange={e => setPlazoSim(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                        required
                      >
                        <option value="12">12 meses (1 año)</option>
                        <option value="24">24 meses (2 años)</option>
                        <option value="36">36 meses (3 años)</option>
                        <option value="48">48 meses (4 años)</option>
                        <option value="60">60 meses (5 años)</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-[#00A4E0] hover:bg-[#008BBF] text-white rounded-xl font-bold transition-all shadow-md mt-4 text-sm"
                    >
                      Calcular Cuotas
                    </button>
                  </form>
                </div>

                {/* Resultado */}
                <div className="lg:col-span-2 space-y-6">
                  {simulado ? (
                    <>
                      <div className="bg-[#003B7A] p-6 rounded-2xl text-white shadow-md flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">CUOTA MENSUAL ESTIMADA</p>
                          <h2 className="text-3xl font-extrabold tracking-tight">
                            Q {cuotaSim.toLocaleString('es-GT', { maximumFractionDigits: 2 })}
                          </h2>
                          <p className="text-[10px] text-blue-100 mt-1">Simulación bajo cuota fija francesa con tasa fija del {tasaSim}% anual</p>
                        </div>
                        <FileText className="w-12 h-12 text-[#00A4E0] opacity-80" />
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b border-slate-200">
                          <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" /> Tabla de Amortización Francesa
                          </h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold border-b border-slate-200 tracking-wider">
                                <th className="p-3">Mes</th>
                                <th className="p-3 text-right">Cuota</th>
                                <th className="p-3 text-right">Interés</th>
                                <th className="p-3 text-right">Capital</th>
                                <th className="p-3 text-right">Saldo Restante</th>
                              </tr>
                            </thead>
                            <tbody>
                              {amortSim.map(row => (
                                <tr key={row.mes} className="border-b border-slate-200 hover:bg-slate-50/50">
                                  <td className="p-3 font-bold text-slate-500">{row.mes}</td>
                                  <td className="p-3 text-right text-slate-700 font-mono">Q {row.cuota.toFixed(2)}</td>
                                  <td className="p-3 text-right text-rose-500 font-mono">Q {row.interes.toFixed(2)}</td>
                                  <td className="p-3 text-right text-emerald-500 font-mono">Q {row.capital.toFixed(2)}</td>
                                  <td className="p-3 text-right text-slate-800 font-bold font-mono">Q {row.saldo.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full min-h-[300px] border border-slate-200 border-dashed rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <HelpCircle className="w-14 h-14 mb-3 opacity-50 text-[#003B7A]" />
                      <h4 className="font-bold text-base text-slate-700">Calcula tu Financiamiento</h4>
                      <p className="max-w-xs text-xs mt-1">Completa el formulario de proyección de la izquierda para simular cuotas e intereses.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}

export default Prestamos;
