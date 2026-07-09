// PagarPrestamo.jsx - Formulario de Pago de Préstamo (Estilo Corporativo Claro)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCuentasUsuario } from '../../services/cuenta.service';
import { obtenerPrestamos, pagarPrestamo } from '../../services/prestamo.service';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ModalAlerta from '../../components/ModalAlerta';
import { Landmark, Calendar, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

function PagarPrestamo() {
  const navigate = useNavigate();

  // Estados de datos
  const [cuentas, setCuentas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Selecciones
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [cuentaOrigenId, setCuentaOrigenId] = useState('');

  // Mensajes de estado
  const [errorForm, setErrorForm] = useState(null);
  const [exitoForm, setExitoForm] = useState(null);

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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setErrorForm(null);

        const [resCuentas, resPrestamos] = await Promise.all([
          obtenerCuentasUsuario(),
          obtenerPrestamos()
        ]);

        if (resCuentas && resCuentas.success) {
          setCuentas(resCuentas.data);
          if (resCuentas.data.length > 0) {
            setCuentaOrigenId(resCuentas.data[0].id_cuenta);
          }
        }

        if (resPrestamos && resPrestamos.success) {
          // Filtrar solo préstamos aprobados con saldo pendiente
          const aprobados = resPrestamos.data.filter(
            p => p.estado === 'APROBADO' && parseFloat(p.saldo_pendiente) > 0
          );
          setPrestamos(aprobados);
          if (aprobados.length > 0) {
            setPrestamoSeleccionado(aprobados[0]);
          }
        }

      } catch (err) {
        console.error('Error al cargar datos de pago de préstamo:', err);
        setErrorForm('Error al comunicarse con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleSeleccionarPrestamo = (e) => {
    const id = parseInt(e.target.value);
    const p = prestamos.find(x => x.id_prestamo === id);
    setPrestamoSeleccionado(p || null);
  };

  // Cálculo de recargos e intereses locales en la UI para feedback visual inmediato
  const cuota = prestamoSeleccionado ? parseFloat(prestamoSeleccionado.cuota_mensual) : 0;
  const saldoPendiente = prestamoSeleccionado ? parseFloat(prestamoSeleccionado.saldo_pendiente) : 0;
  const limitePago = prestamoSeleccionado?.fecha_limite_pago ? new Date(prestamoSeleccionado.fecha_limite_pago) : null;
  const hoy = new Date();
  
  const tieneAtraso = limitePago && hoy > limitePago;
  const recargo = tieneAtraso ? cuota * 0.05 : 0;
  const totalPagar = cuota + recargo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prestamoSeleccionado || !cuentaOrigenId) {
      const msg = 'Debe seleccionar un préstamo y una cuenta de origen.';
      setErrorForm(msg);
      abrirModal('Error en el Pago', msg, 'error');
      return;
    }

    try {
      setProcesando(true);
      setErrorForm(null);
      setExitoForm(null);

      const res = await pagarPrestamo(prestamoSeleccionado.id_prestamo, {
        id_cuenta_origen: parseInt(cuentaOrigenId)
      });

      if (res && res.success) {
        setExitoForm('✓ Pago de cuota de préstamo procesado con éxito.');
        abrirModal('¡Pago Exitoso!', '¡Felicidades, pagaste el crédito!', 'success');
        // Recargar préstamos y cuentas
        const [resCuentas, resPrestamos] = await Promise.all([
          obtenerCuentasUsuario(),
          obtenerPrestamos()
        ]);
        
        if (resCuentas && resCuentas.success) {
          setCuentas(resCuentas.data);
        }
        
        if (resPrestamos && resPrestamos.success) {
          const aprobados = resPrestamos.data.filter(
            p => p.estado === 'APROBADO' && parseFloat(p.saldo_pendiente) > 0
          );
          setPrestamos(aprobados);
          // Buscar el préstamo actual actualizado
          const actualizado = aprobados.find(x => x.id_prestamo === prestamoSeleccionado.id_prestamo);
          setPrestamoSeleccionado(actualizado || aprobados[0] || null);
        }
      } else {
        const msg = res.error?.message || 'Error al procesar el pago.';
        setErrorForm(msg);
        abrirModal('Error en el Pago', `No se pudo realizar el pago:\n\n${msg}`, 'error');
      }
    } catch (err) {
      console.error('Error al efectuar pago:', err);
      const msg = err.response?.data?.error?.message || 'Error de red al procesar el pago.';
      setErrorForm(msg);
      abrirModal('Error en el Pago', `No se pudo realizar el pago:\n\n${msg}`, 'error');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-[#003B7A] font-bold text-lg animate-pulse">Cargando datos de préstamos...</div>
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
                  <Landmark className="w-5 h-5 text-[#00A4E0]" /> Pago de Préstamo
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Efectúa el pago mensual de tus cuotas de financiamiento
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
                <CheckCircle className="w-4 h-4 shrink-0" />
                {exitoForm}
              </div>
            )}

            {prestamos.length === 0 ? (
              <div className="border border-slate-200 border-dashed rounded-2xl p-10 text-center text-slate-400 bg-slate-50">
                <Landmark className="w-12 h-12 mx-auto mb-3 opacity-55" />
                <h3 className="text-base font-bold text-slate-700">Sin Préstamos Activos</h3>
                <p className="text-xs mt-1 max-w-xs mx-auto">No posees ningún préstamo activo con saldo pendiente en este momento.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Selección de Préstamo */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Préstamo Activo</label>
                  <select 
                    value={prestamoSeleccionado?.id_prestamo || ''}
                    onChange={handleSeleccionarPrestamo}
                    className="w-full border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                  >
                    {prestamos.map(p => (
                      <option key={p.id_prestamo} value={p.id_prestamo}>
                        No. {p.id_prestamo} (Monto: Q{parseFloat(p.monto_solicitado).toFixed(2)} | Pendiente: Q{parseFloat(p.saldo_pendiente).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Selección de Cuenta Origen */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Cuenta de Origen</label>
                  <select 
                    value={cuentaOrigenId}
                    onChange={e => setCuentaOrigenId(e.target.value)}
                    className="w-full border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 bg-slate-50 font-semibold"
                    required
                  >
                    {cuentas.map(c => (
                      <option key={c.id_cuenta} value={c.id_cuenta}>
                        {c.numero_cuenta} ({c.tipo_cuenta}) - Saldo: {c.simbolo} {parseFloat(c.saldo).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Resumen y Liquidación */}
                {prestamoSeleccionado && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
                      <Calendar className="w-3.5 h-3.5" /> Detalle de Liquidación de la Cuota
                    </h4>
                    
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500">Monto de la Cuota:</span>
                      <span className="font-mono font-bold text-slate-800">Q {cuota.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500">Límite de Pago:</span>
                      <span className={`font-semibold ${tieneAtraso ? 'text-rose-600' : 'text-slate-700'}`}>
                        {limitePago ? limitePago.toLocaleDateString('es-GT') : 'Sin fecha'}
                        {tieneAtraso && ' (Atrasado)'}
                      </span>
                    </div>

                    {tieneAtraso && (
                      <div className="flex justify-between items-center text-sm font-medium text-rose-600 bg-rose-50/50 p-2 rounded border border-rose-100">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 shrink-0" /> Recargo por Mora (5%):
                        </span>
                        <span className="font-mono font-extrabold">Q {recargo.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-base font-bold">
                      <span className="text-slate-800">Total a Debitar:</span>
                      <span className="text-[#003B7A] font-extrabold font-mono text-lg">Q {totalPagar.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Botón de Confirmación */}
                <button
                  type="submit"
                  disabled={procesando}
                  className="w-full py-4 bg-[#003B7A] hover:bg-[#002752] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-350 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Procesando Pago...' : 'Confirmar y Pagar Cuota'}
                </button>

              </form>
            )}

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

export default PagarPrestamo;
