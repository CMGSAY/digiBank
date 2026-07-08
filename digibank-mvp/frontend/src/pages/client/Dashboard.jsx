// Dashboard.jsx - Panel de Clientes (Estilo Corporativo DigiBank)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerCuentasUsuario } from '../../services/cuenta.service';
import { transferirFondos, convertirDivisas, obtenerHistorialTransacciones } from '../../services/transaccion.service';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

import { 
  RefreshCw, Clock, CheckCircle, XCircle, Landmark, Facebook, MoreVertical 
} from 'lucide-react';

function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // === TODA LA LÓGICA DE ESTADO SE MANTIENE INTACTA PARA EVITAR CRASHES ===
  const [cuentas, setCuentas] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  
  const [cargandoCuentas, setCargandoCuentas] = useState(true);
  const [cargandoTxs, setCargandoTxs] = useState(false);
  const [errorForm, setErrorForm] = useState(null);
  const [exitoForm, setExitoForm] = useState(null);
  
  // Controles de visibilidad de formularios (Mantenidos para compatibilidad lógica)
  const [mostrarTransferir, setMostrarTransferir] = useState(false);
  const [mostrarConvertir, setMostrarConvertir] = useState(false);
  
  // Campos de formulario (Mantenidos para compatibilidad lógica)
  const [destinatario, setDestinatario] = useState('');
  const [montoTransferir, setMontoTransferir] = useState('');
  const [concepto, setConcepto] = useState('');
  const [montoConvertir, setMontoConvertir] = useState('');
  const [cuentaDestinoConversion, setCuentaDestinoConversion] = useState('');

  // Modal para historial por mes
  const [modalMesAbierto, setModalMesAbierto] = useState(false);
  const [cuentaParaHistorial, setCuentaParaHistorial] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState('07');
  const [anioSeleccionado, setAnioSeleccionado] = useState('2026');

  const mesesDisponibles = [
    { valor: '02', label: 'Febrero, 2026' },
    { valor: '03', label: 'Marzo, 2026' },
    { valor: '04', label: 'Abril, 2026' },
    { valor: '05', label: 'Mayo, 2026' },
    { valor: '06', label: 'Junio, 2026' },
    { valor: '07', label: 'Julio, 2026' }
  ];

  // Cargar Cuentas
  const cargarCuentas = async () => {
    try {
      setCargandoCuentas(true);
      setErrorForm(null);
      const res = await obtenerCuentasUsuario();
      if (res && res.success) {
        setCuentas(res.data);
        if (res.data.length > 0) {
          setCuentaSeleccionada(prev => {
            if (prev) {
              const actualizada = res.data.find(c => c.id_cuenta === prev.id_cuenta);
              return actualizada || res.data[0];
            }
            return res.data[0];
          });
        }
      } else {
        setErrorForm('No se pudieron consultar las cuentas.');
      }
    } catch (err) {
      console.error('Error al cargar cuentas:', err);
      setErrorForm('Error al comunicarse con el servidor.');
    } finally {
      setCargandoCuentas(false);
    }
  };

  // Cargar Historial Reciente (Últimas 10 transacciones)
  const cargarHistorial = async (idCuenta) => {
    if (!idCuenta) return;
    try {
      setCargandoTxs(true);
      const res = await obtenerHistorialTransacciones(idCuenta, 1, 10);
      if (res && res.success) {
        setTransacciones(res.data.transacciones);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setCargandoTxs(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  useEffect(() => {
    if (cuentaSeleccionada) {
      cargarHistorial(cuentaSeleccionada.id_cuenta);
    }
  }, [cuentaSeleccionada]);

  // Ejecutar Transferencia (Mantenida por compatibilidad de lógica)
  const handleTransferencia = async (e) => {
    e.preventDefault();
    setErrorForm(null);
    setExitoForm(null);
    try {
      const payload = {
        id_cuenta_origen: cuentaSeleccionada.id_cuenta,
        numero_cuenta_destino: destinatario,
        monto: parseFloat(montoTransferir),
        descripcion: concepto
      };

      const res = await transferirFondos(payload);
      if (res && res.success) {
        setExitoForm('✓ Transferencia ejecutada con éxito.');
        setDestinatario('');
        setMontoTransferir('');
        setConcepto('');
        setMostrarTransferir(false);
        await cargarCuentas();
      } else {
        setErrorForm(res.error?.message || 'Error al realizar la transferencia.');
      }
    } catch (err) {
      console.error('Error en transferencia:', err);
      setErrorForm(err.response?.data?.error?.message || 'Error de red al procesar transferencia.');
    }
  };

  // Ejecutar Conversión (Mantenida por compatibilidad de lógica)
  const handleConversion = async (e) => {
    e.preventDefault();
    setErrorForm(null);
    setExitoForm(null);
    try {
      const payload = {
        id_cuenta_origen: cuentaSeleccionada.id_cuenta,
        id_cuenta_destino: parseInt(cuentaDestinoConversion),
        monto_origen: parseFloat(montoConvertir)
      };

      const res = await convertirDivisas(payload);
      if (res && res.success) {
        setExitoForm('✓ Conversión de divisas realizada con éxito.');
        setMontoConvertir('');
        setCuentaDestinoConversion('');
        setMostrarConvertir(false);
        await cargarCuentas();
      } else {
        setErrorForm(res.error?.message || 'Error al realizar la conversión.');
      }
    } catch (err) {
      console.error('Error en conversión:', err);
      setErrorForm(err.response?.data?.error?.message || 'Error de red al procesar conversión.');
    }
  };

  const abrirModalHistorial = (cuenta) => {
    setCuentaParaHistorial(cuenta);
    setModalMesAbierto(true);
  };

  const handleConsultarHistorial = () => {
    if (!cuentaParaHistorial) return;
    setModalMesAbierto(false);
    navigate(`/banca/historial?cuenta=${cuentaParaHistorial.id_cuenta}&mes=${mesSeleccionado}&anio=${anioSeleccionado}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar a la izquierda (arriba en móvil) */}
      <Sidebar />

      {/* Contenedor Derecho */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* Cabecera Superior */}
        <Navbar />

        {/* Área central de contenido */}
        <div className="flex-1 overflow-y-auto relative flex flex-col bg-slate-100 text-slate-800">
          
          {/* Marca de agua */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none overflow-hidden">
            <Landmark className="w-[800px] h-[800px] text-[#003B7A]" />
          </div>

          <main className="p-8 md:p-10 flex-grow z-10 w-full max-w-6xl mx-auto space-y-6">
            
            {/* Banner Publicitario Estático */}
            <div className="bg-gradient-to-r from-[#003B7A] to-[#00A4E0] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold">¡Multiplica tus ahorros con DigiBank!</h3>
                <p className="text-sm text-blue-100 mt-1">Abre tu Cuenta de Ahorro Electrónica hoy mismo con tasas de interés hasta el 5.5% anual.</p>
              </div>
              <button className="px-6 py-2.5 bg-white text-[#003B7A] font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm shrink-0">
                Saber más
              </button>
            </div>

            {/* Alertas */}
            {exitoForm && (
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded shadow-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" /> <span>{exitoForm}</span>
              </div>
            )}
            {errorForm && (
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded shadow-sm flex items-center gap-2">
                <XCircle className="w-5 h-5 shrink-0" /> <span>{errorForm}</span>
              </div>
            )}

            {/* Cuentas Grid */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-[#003B7A] tracking-tight">Tus Cuentas Bancarias</h3>
                <button onClick={cargarCuentas} className="p-2 text-slate-400 hover:text-[#003B7A] transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {cargandoCuentas ? (
                <div className="text-slate-500 text-sm">Consultando cuentas locales...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cuentas.map(c => (
                    <div 
                      key={c.id_cuenta}
                      onClick={() => setCuentaSeleccionada(c)}
                      className={`bg-white p-5 rounded-xl border border-slate-200 cursor-pointer transition-all shadow-sm hover:shadow relative ${
                        cuentaSeleccionada?.id_cuenta === c.id_cuenta 
                          ? 'ring-2 ring-[#00A4E0] border-transparent shadow' 
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link 
                            to={`/banca/cuenta/${c.id_cuenta}`}
                            className="text-[#003B7A] hover:text-[#00A4E0] font-bold underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            DIGIBANK - {c.numero_cuenta}
                          </Link>
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            ({usuario?.nombres} {usuario?.apellidos})
                          </span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-4">
                        <span className="text-xs text-slate-500 font-semibold uppercase block mb-1">{c.tipo_cuenta}</span>
                        <div className="text-2xl font-extrabold text-[#003B7A] flex items-baseline gap-1">
                          <span className="text-lg font-bold">{c.simbolo}</span>
                          {parseFloat(c.saldo).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                          Moneda: {c.codigo_iso}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalHistorial(c);
                          }}
                          className="text-[#00A4E0] hover:text-[#003B7A] font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          Historial mes actual <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Historial Panel */}
            {cuentaSeleccionada && (
              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-[#003B7A] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Clock className="w-5 h-5" /> Movimientos Recientes (Últimos 10)
                </h3>

                {cargandoTxs ? (
                  <div className="text-slate-500 text-sm">Cargando movimientos...</div>
                ) : transacciones.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-xl shadow-sm">
                    No hay transacciones registradas.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#003B7A] text-white text-xs font-bold uppercase tracking-wider">
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Referencia</th>
                          <th className="p-4">Descripción</th>
                          <th className="p-4 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacciones.map(t => {
                          const esDebito = t.id_cuenta_origen === cuentaSeleccionada.id_cuenta;
                          return (
                            <tr key={t.id_transaccion} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-4 text-slate-600">{new Date(t.fecha).toLocaleDateString()}</td>
                              <td className="p-4 font-mono text-xs text-slate-400">{t.numero_referencia}</td>
                              <td className="p-4 text-slate-800 font-medium">{t.descripcion}</td>
                              <td className={`p-4 text-right font-bold ${esDebito ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {esDebito ? '-' : '+'} {cuentaSeleccionada.simbolo}{parseFloat(esDebito ? t.monto_origen : t.monto_destino).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </main>

          {/* Footer Corporativo */}
          <footer className="bg-[#0b334d] text-white px-10 py-12 z-10 mt-auto border-t-[12px] border-[#003B7A]">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="w-10 h-10 text-white" />
                  <span className="text-3xl font-extrabold tracking-widest">DIGIBANK</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold mb-3 uppercase tracking-wider text-sm">Contacto</h4>
                <p className="text-xs text-blue-200">PBX: (502) 2419-2020</p>
                <p className="text-xs font-bold text-white">info@digibank.com.gt</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold mb-3 uppercase tracking-wider text-sm">Oficinas Centrales</h4>
                <p className="text-xs text-blue-200">Avenida Las Américas, Zona 3</p>
                <p className="text-xs text-blue-200">Quetzaltenango, Guatemala</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold mb-3 uppercase tracking-wider text-sm">Síguenos En</h4>
                <a href="#" className="inline-block text-white hover:text-blue-300 transition-colors">
                  <Facebook className="w-8 h-8" fill="currentColor" />
                </a>
              </div>

            </div>
          </footer>
        </div>
      </div>

      {/* Modal de Selección de Mes */}
      {modalMesAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#003B7A]">Consultar Historial de Cuenta</h3>
              <p className="text-sm text-slate-500 mt-1">Selecciona el mes y año para ver los movimientos de la cuenta <span className="font-semibold text-slate-800">{cuentaParaHistorial?.numero_cuenta}</span>.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">SELECCIONAR MES</label>
                <div className="grid grid-cols-2 gap-2">
                  {mesesDisponibles.map(m => (
                    <button
                      key={m.valor}
                      type="button"
                      onClick={() => setMesSeleccionado(m.valor)}
                      className={`py-2 px-3 rounded-lg text-sm font-semibold border text-center transition-all ${
                        mesSeleccionado === m.valor
                          ? 'border-[#00A4E0] bg-[#00A4E0]/10 text-[#003B7A] font-bold shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">AÑO</label>
                <select
                  value={anioSeleccionado}
                  onChange={e => setAnioSeleccionado(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg outline-none text-sm text-slate-700 bg-slate-50"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMesAbierto(false)}
                className="px-5 py-2 text-slate-500 font-bold hover:text-slate-800 text-sm"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleConsultarHistorial}
                className="px-6 py-2 bg-[#00A4E0] hover:bg-[#0088cc] text-white font-bold rounded-lg shadow-sm text-sm"
              >
                Consultar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;