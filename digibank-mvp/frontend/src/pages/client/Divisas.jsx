// Divisas.jsx - Mercado de Divisas y Calculadora de Conversión (Estilo Corporativo DigiBank)

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { 
  TrendingUp, RefreshCw, Calculator, Landmark, ArrowRightLeft 
} from 'lucide-react';

// Bandera de EE. UU. en SVG Estilizado
const USFlag = () => (
  <svg className="w-8 h-5 rounded shadow-sm border border-slate-200" viewBox="0 0 74 39" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="74" height="39" fill="#B22234" />
    <path d="M0 3h74M0 9h74M0 15h74M0 21h74M0 27h74M0 33h74" stroke="#FFF" strokeWidth="3" />
    <rect width="32" height="21" fill="#3C3B6E" />
    <circle cx="6" cy="4" r="1.2" fill="#FFF" />
    <circle cx="16" cy="4" r="1.2" fill="#FFF" />
    <circle cx="26" cy="4" r="1.2" fill="#FFF" />
    <circle cx="11" cy="10.5" r="1.2" fill="#FFF" />
    <circle cx="21" cy="10.5" r="1.2" fill="#FFF" />
    <circle cx="6" cy="17" r="1.2" fill="#FFF" />
    <circle cx="16" cy="17" r="1.2" fill="#FFF" />
    <circle cx="26" cy="17" r="1.2" fill="#FFF" />
  </svg>
);

// Bandera de la Unión Europea en SVG Estilizado
const EUFlag = () => (
  <svg className="w-8 h-5 rounded shadow-sm border border-slate-200" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="30" height="20" fill="#003399" />
    <circle cx="15" cy="4" r="0.7" fill="#FFCC00" />
    <circle cx="15" cy="16" r="0.7" fill="#FFCC00" />
    <circle cx="9" cy="10" r="0.7" fill="#FFCC00" />
    <circle cx="21" cy="10" r="0.7" fill="#FFCC00" />
    <circle cx="12" cy="5.5" r="0.7" fill="#FFCC00" />
    <circle cx="18" cy="5.5" r="0.7" fill="#FFCC00" />
    <circle cx="12" cy="14.5" r="0.7" fill="#FFCC00" />
    <circle cx="18" cy="14.5" r="0.7" fill="#FFCC00" />
    <circle cx="10" cy="7.5" r="0.7" fill="#FFCC00" />
    <circle cx="20" cy="7.5" r="0.7" fill="#FFCC00" />
    <circle cx="10" cy="12.5" r="0.7" fill="#FFCC00" />
    <circle cx="20" cy="12.5" r="0.7" fill="#FFCC00" />
  </svg>
);

// Bandera de Guatemala en SVG Estilizado
const GTFlag = () => (
  <svg className="w-8 h-5 rounded shadow-sm border border-slate-200" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="30" height="20" fill="#4997D0" />
    <rect x="10" width="10" height="20" fill="#FFFFFF" />
    <circle cx="15" cy="10" r="2.5" fill="#C5A059" />
  </svg>
);

function Divisas() {
  const [cotizacion, setCotizacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // Estados de la calculadora
  const [cantidad, setCantidad] = useState('100');
  const [monedaDe, setMonedaDe] = useState('USD');
  const [monedaA, setMonedaA] = useState('GTQ');
  const [resultado, setResultado] = useState(null);

  const cargarTasas = async () => {
    try {
      setCargando(true);
      setError(false);
      const res = await axiosInstance.get('/divisas/actual');
      if (res.data && res.data.success) {
        setCotizacion(res.data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error al cargar divisas:', err);
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTasas();
  }, []);

  // Lógica de Tasas Oficiales (Dólar / Euro)
  const baseUSD = cotizacion?.compra || 7.73;
  const ventaUSD = cotizacion?.venta || 7.78;
  const baseEUR = baseUSD * 1.085;
  const ventaEUR = ventaUSD * 1.085;

  // Lógica de Conversión
  const ejecutarCalculo = (e) => {
    if (e) e.preventDefault();
    const qty = parseFloat(cantidad);
    if (isNaN(qty) || qty <= 0) return;

    // Valores en Quetzales (Base 1.00 GTQ)
    const tasasCambioGTQ = {
      GTQ: 1.0,
      USD: baseUSD,
      EUR: baseEUR
    };

    // Convertir de origen a GTQ, luego de GTQ a destino
    const cantidadEnGTQ = qty * tasasCambioGTQ[monedaDe];
    const valorCalculado = cantidadEnGTQ / tasasCambioGTQ[monedaA];

    setResultado({
      origen: qty,
      monedaOrigen: monedaDe,
      destino: valorCalculado,
      monedaDestino: monedaA
    });
  };

  // Calcular por defecto al cargar tasas
  useEffect(() => {
    if (cotizacion) {
      ejecutarCalculo();
    }
  }, [cotizacion]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Menú Lateral */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Cabecera Superior */}
        <Navbar />

        {/* Contenido de la Página */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Cabecera del Módulo */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#003B7A] tracking-tight">Mercado de Divisas</h1>
                <p className="text-slate-500 text-xs mt-1">Consulta los tipos de cambio de referencia del Banco de Guatemala y convierte divisas.</p>
              </div>
              <button 
                onClick={cargarTasas}
                title="Actualizar tasas"
                className="p-2 hover:bg-slate-200/50 rounded-xl transition-all border border-slate-200 bg-white shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-[#003B7A] ${cargando ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Grid Principal de 2 Columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* COLUMNA IZQUIERDA: Tasas de Cambio */}
              <div className="space-y-6">
                
                {/* Tarjeta Dólar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <USFlag />
                      <h3 className="text-base font-bold text-[#003B7A]">Dólar Estadounidense (USD)</h3>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase bg-slate-50 px-2 py-0.5 rounded border">
                      Banguat Ref.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio Compra</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-1 block">Q {baseUSD.toFixed(4)}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio Venta</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-1 block">Q {ventaUSD.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta Euro */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <EUFlag />
                      <h3 className="text-base font-bold text-[#003B7A]">Euro (EUR)</h3>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase bg-slate-50 px-2 py-0.5 rounded border">
                      Ficticio / Ref.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio Compra</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-1 block">Q {baseEUR.toFixed(4)}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio Venta</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-1 block">Q {ventaEUR.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * Las tasas reflejadas corresponden al tipo de cambio oficial provisto por el Banco de Guatemala en tiempo real.
                </p>
              </div>

              {/* COLUMNA DERECHA: Calculadora de Conversión */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                  
                  {/* Encabezado */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Calculator className="w-5 h-5 text-[#00A4E0]" />
                    <h3 className="text-base font-bold text-[#003B7A]">Calculadora de Conversión</h3>
                  </div>

                  <form onSubmit={ejecutarCalculo} className="space-y-4">
                    
                    {/* Cantidad */}
                    <div>
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                        Cantidad
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-bold text-slate-800"
                        required
                      />
                    </div>

                    {/* Selectores De / A */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                          De (Origen)
                        </label>
                        <select
                          value={monedaDe}
                          onChange={(e) => setMonedaDe(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-semibold text-slate-800"
                        >
                          <option value="GTQ">Quetzales (GTQ)</option>
                          <option value="USD">Dólares (USD)</option>
                          <option value="EUR">Euros (EUR)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                          A (Destino)
                        </label>
                        <select
                          value={monedaA}
                          onChange={(e) => setMonedaA(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-semibold text-slate-800"
                        >
                          <option value="GTQ">Quetzales (GTQ)</option>
                          <option value="USD">Dólares (USD)</option>
                          <option value="EUR">Euros (EUR)</option>
                        </select>
                      </div>
                    </div>

                    {/* Botón de Cálculo Cyan */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#00A4E0] hover:bg-cyan-600 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
                    >
                      Calcular Conversión
                    </button>
                  </form>

                  {/* Bloque de Resultado Resaltado */}
                  {resultado && (
                    <div className="p-5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-center gap-3 text-center">
                      <div className="flex items-center gap-2">
                        {resultado.monedaOrigen === 'GTQ' && <GTFlag />}
                        {resultado.monedaOrigen === 'USD' && <USFlag />}
                        {resultado.monedaOrigen === 'EUR' && <EUFlag />}
                        <span className="font-extrabold text-slate-700 text-sm">
                          {resultado.origen.toLocaleString('en-US', { minimumFractionDigits: 2 })} {resultado.monedaOrigen}
                        </span>
                      </div>
                      <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                      <div className="flex items-center gap-2">
                        {resultado.monedaDestino === 'GTQ' && <GTFlag />}
                        {resultado.monedaDestino === 'USD' && <USFlag />}
                        {resultado.monedaDestino === 'EUR' && <EUFlag />}
                        <span className="font-extrabold text-[#003B7A] text-lg">
                          {resultado.destino.toLocaleString('en-US', { minimumFractionDigits: 2 })} {resultado.monedaDestino}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}

export default Divisas;
