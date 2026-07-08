// SolicitudPrestamo.jsx - Formulario de Solicitud de Préstamo (Estilo Corporativo Claro)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCuentasUsuario } from '../../services/cuenta.service';
import { solicitarPrestamo } from '../../services/prestamo.service';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Calculator, Landmark, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

function SolicitudPrestamo() {
  const navigate = useNavigate();

  // Estados
  const [cuentas, setCuentas] = useState([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Campos de Formulario
  const [cuentaDesembolsoId, setCuentaDesembolsoId] = useState('');
  const [monto, setMonto] = useState('');
  const [ingresos, setIngresos] = useState('');
  const [estabilidad, setEstabilidad] = useState('1'); // Años de estabilidad por defecto
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Mensajes de feedback
  const [errorForm, setErrorForm] = useState(null);
  const [exitoForm, setExitoForm] = useState(null);

  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        setCargandoCuentas(true);
        const res = await obtenerCuentasUsuario();
        if (res && res.success) {
          setCuentas(res.data);
          if (res.data.length > 0) {
            setCuentaDesembolsoId(res.data[0].id_cuenta);
          }
        }
      } catch (err) {
        console.error('Error al cargar cuentas del cliente:', err);
        setErrorForm('No se pudieron obtener las cuentas de desembolso.');
      } finally {
        setCargandoCuentas(false);
      }
    };

    cargarCuentas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cuentaDesembolsoId || !monto || !ingresos || !estabilidad || !telefono) {
      setErrorForm('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setProcesando(true);
      setErrorForm(null);
      setExitoForm(null);

      const payload = {
        id_cuenta_desembolso: parseInt(cuentaDesembolsoId),
        monto_solicitado: parseFloat(monto),
        ingresos_declarados: parseFloat(ingresos),
        estabilidad: parseFloat(estabilidad),
        telefono,
        descripcion
      };

      const res = await solicitarPrestamo(payload);
      if (res && res.success) {
        setExitoForm(res.data.mensaje);
        // Limpiar campos no estáticos
        setMonto('');
        setIngresos('');
        setEstabilidad('1');
        setTelefono('');
        setDescripcion('');
      } else {
        setErrorForm(res.error?.message || 'Error al enviar la solicitud.');
      }
    } catch (err) {
      console.error('Error al solicitar préstamo:', err);
      setErrorForm(err.response?.data?.error?.message || 'Error al comunicarse con el servidor.');
    } finally {
      setProcesando(false);
    }
  };

  if (cargandoCuentas) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-[#003B7A] font-bold text-lg animate-pulse">Cargando cuentas del cliente...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor Derecho */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden bg-white">
        
        {/* Navbar */}
        <Navbar />

        {/* Formulario */}
        <div className="flex-1 overflow-y-auto p-8 bg-white flex flex-col items-center">
          
          <div className="max-w-xl mx-auto w-full pb-10 flex flex-col space-y-6">
            
            {/* Header de la Vista */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-[#003B7A] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#00A4E0]" /> Solicitud de Préstamo
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Completa la información para solicitar financiamiento inmediato
                </p>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="border border-[#00A4E0] text-[#00A4E0] hover:bg-[#00A4E0] hover:text-white px-4 py-1.5 font-medium rounded-lg transition-all text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Regresar
              </button>
            </div>

            {errorForm && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorForm}
              </div>
            )}

            {exitoForm && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {exitoForm}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              
              {/* 1. Cuenta de Desembolso */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Cuenta para Depositar</label>
                <select 
                  value={cuentaDesembolsoId}
                  onChange={e => setCuentaDesembolsoId(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                  required
                >
                  {cuentas.map(c => (
                    <option key={c.id_cuenta} value={c.id_cuenta}>
                      {c.numero_cuenta} ({c.tipo_cuenta}) - Saldo: {c.simbolo} {parseFloat(c.saldo).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Monto del Préstamo */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Monto Solicitado (Q)</label>
                  <input 
                    type="number"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder="Monto total del crédito"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                    min={100}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">* Montos &gt; Q3,000 requieren validación manual.</p>
                </div>

                {/* 3. Ingresos Mensuales */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ingresos Mensuales (Q)</label>
                  <input 
                    type="number"
                    value={ingresos}
                    onChange={e => setIngresos(e.target.value)}
                    placeholder="Tus ingresos declarados"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                    min={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 4. Estabilidad Laboral */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Estabilidad Laboral (Años)</label>
                  <input 
                    type="number"
                    value={estabilidad}
                    onChange={e => setEstabilidad(e.target.value)}
                    placeholder="Años en tu empleo actual"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                    min={0}
                    step={0.5}
                  />
                </div>

                {/* 5. Teléfono de Contacto */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono de Contacto</label>
                  <input 
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Número de celular"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* 6. Descripción del destino */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción / Destino de Fondos</label>
                <textarea 
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalla en qué usarás el préstamo (inversión, gastos médicos, etc.)"
                  rows="3"
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold resize-none"
                />
              </div>

              {/* Botón Enviar en color Cyan */}
              <button
                type="submit"
                disabled={procesando}
                className="w-full py-4 bg-[#00A4E0] hover:bg-[#008BBF] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {procesando ? 'Enviando Solicitud...' : 'Enviar Solicitud de Préstamo'}
              </button>

            </form>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-700">
              <Landmark className="w-5 h-5 shrink-0 text-[#00A4E0]" />
              <div>
                <span className="font-bold block mb-0.5">Información sobre Aprobación Automática</span>
                Si el monto es menor o igual a Q3,000 y cuentas con al menos 1 año de estabilidad laboral y la cuota estimada no excede el 30% de tus ingresos, el préstamo se desembolsará inmediatamente.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SolicitudPrestamo;
