// DetalleCuenta.jsx - Vista de Detalles y Estado de Cuenta Dinámico (MySQL / Express Integration)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { obtenerDetalleCuenta } from '../../services/cuenta.service';
import { obtenerHistorialPorMes } from '../../services/transaccion.service';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function DetalleCuenta() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de control de carga y error
  const [cargando, setCargando] = useState(true);
  const [errorStatus, setErrorStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados de datos dinámicos
  const [cuentaInfo, setCuentaInfo] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [fechaUltimoMovimiento, setFechaUltimoMovimiento] = useState("Sin movimientos en el mes");

  // Auditoría inferior
  const [fechaImpresion, setFechaImpresion] = useState('');
  const [horaImpresion, setHoraImpresion] = useState('');
  const [autorizacionNo] = useState('1235468011');

  useEffect(() => {
    // Generar datos dinámicos de auditoría
    const ahora = new Date();
    const diaStr = String(ahora.getDate()).padStart(2, '0');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesStrLabel = meses[ahora.getMonth()];
    const anioStrLabel = ahora.getFullYear();
    setFechaImpresion(`${diaStr} - ${mesStrLabel} - ${anioStrLabel}`);

    let horas = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    horas = horas % 12;
    horas = horas ? horas : 12;
    setHoraImpresion(`${String(horas).padStart(2, '0')}:${minutos}:${segundos} ${ampm}`);

    const cargarDatosCuenta = async () => {
      try {
        setCargando(true);
        setErrorStatus(false);

        // 1. Obtener detalles de la cuenta
        const resDetalle = await obtenerDetalleCuenta(id);
        if (resDetalle && resDetalle.success) {
          setCuentaInfo(resDetalle.data);
        } else {
          setErrorStatus(true);
          setErrorMessage('No se pudo encontrar información de esta cuenta.');
          return;
        }
      } catch (err) {
        console.error('Error al cargar detalle de la cuenta:', err);
        setErrorStatus(true);
        setErrorMessage(err.response?.data?.error?.message || 'Error de conexión con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatosCuenta();
  }, [id]);

  if (cargando) {
    return (
      <div className="flex h-screen bg-white font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center bg-white">
            <div className="text-[#003B7A] font-bold text-lg animate-pulse">Cargando estado de cuenta...</div>
          </div>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex flex-col items-center justify-center bg-white p-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-red-600 font-extrabold text-xl">Error al Cargar la Cuenta</h2>
            <p className="text-slate-500 text-sm max-w-md text-center">{errorMessage}</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-[#003B7A] hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Volver Atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* Menú Lateral */}
      <Sidebar />

      {/* Contenedor Derecho */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Cabecera Superior */}
        <Navbar />

        {/* Área del Estado de Cuenta Estilo Documento Impreso */}
        <div className="flex-grow overflow-y-auto p-8 bg-white text-slate-800 flex flex-col">

          <div className="max-w-4xl mx-auto w-full pb-10 flex flex-col flex-1 space-y-8">
            
            {/* Encabezado Principal */}
            <div className="pb-4">
              <h2 className="text-[#003B7A] text-2xl font-bold">Monetarias</h2>
              <p className="text-slate-600 text-lg">Saldo de cuentas</p>
              <div className="border-b border-slate-300 mt-3"></div>
            </div>

            {/* Sección 1: Detalle Cuenta Monetaria */}
            <div className="space-y-3">
              <div className="flex items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Detalle cuenta monetaria</h3>
              </div>
              <div className="border-b border-slate-200"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm pt-1">
                <div className="flex gap-4">
                  <span className="text-slate-500 w-36 font-medium">Nombre de cuenta</span>
                  <span className="text-slate-700 font-bold uppercase">{cuentaInfo?.nombre_titular}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-500 w-36 font-medium">No. de cuenta</span>
                  <span className="text-slate-700 font-mono font-bold">{cuentaInfo?.numero_cuenta}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-500 w-36 font-medium">Tipo de moneda</span>
                  <span className="text-slate-700 font-bold">{cuentaInfo?.codigo_iso} ({cuentaInfo?.tipo_cuenta})</span>
                </div>
              </div>
            </div>

            {/* Sección 2: Saldos */}
            <div className="space-y-3">
              <div className="flex items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Saldos</h3>
              </div>
              <div className="border-b border-slate-200"></div>

              <div className="space-y-2 text-sm pt-1 max-w-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Saldo disponible</span>
                  <div className="flex justify-between w-32 font-mono font-bold text-[#003B7A]">
                    <span>{cuentaInfo?.simbolo}</span>
                    <span>{cuentaInfo?.saldo_disponible.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Saldo total</span>
                  <div className="flex justify-between w-32 font-mono font-bold text-slate-700">
                    <span>{cuentaInfo?.simbolo}</span>
                    <span>{cuentaInfo?.saldo_total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Sobregiro autorizado</span>
                  <div className="flex justify-between w-32 font-mono font-medium text-slate-500">
                    <span>{cuentaInfo?.simbolo}</span>
                    <span>{cuentaInfo?.sobregiro_autorizado.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Tabla de Reservas */}
            {cuentaInfo?.reservas && cuentaInfo.reservas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Reservas</h3>
                
                <div className="border border-slate-200 rounded-none overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#003B7A] text-white text-xs font-bold uppercase tracking-wider text-center">
                        <th className="p-2 border-r border-[#002752] text-left">NOMBRE</th>
                        <th className="p-2 border-r border-[#002752] w-1/3">ANTERIOR</th>
                        <th className="p-2 w-1/3">HOY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentaInfo.reservas.map((res, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-slate-200 hover:bg-slate-50 transition-colors text-center ${
                            idx % 2 !== 0 ? 'bg-slate-50/50' : ''
                          }`}
                        >
                          <td className="p-2 text-left text-slate-700 font-medium border-r border-slate-200">{res.nombre}</td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="flex justify-between w-full font-mono px-4 text-slate-500">
                              <span>{cuentaInfo.simbolo}</span>
                              <span>{res.anterior.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex justify-between w-full font-mono px-4 font-bold text-slate-700">
                              <span>{cuentaInfo.simbolo}</span>
                              <span>{res.hoy.toFixed(2)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Movimientos del mes removidos de la vista de detalle a solicitud del usuario */}

            {/* Botón de Regresar */}
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => navigate(-1)}
                className="border border-[#00A4E0] text-[#00A4E0] hover:bg-[#00A4E0] hover:text-white px-8 py-2 font-semibold rounded-none transition-all text-sm"
              >
                Regresar
              </button>
            </div>

            {/* Footer de Auditoría de Impresión */}
            <div className="bg-slate-100 border border-slate-200 text-slate-600 font-medium text-xs py-3 px-6 rounded-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left mt-auto">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">Entidad</span>
                Banco de Guatemala / DigiBank
              </div>
              <div className="md:text-center">
                <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">Fecha de impresión</span>
                {fechaImpresion}
              </div>
              <div className="md:text-center">
                <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">Hora de impresión</span>
                {horaImpresion}
              </div>
              <div className="md:text-right">
                <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">Certificación</span>
                Autorización No. {autorizacionNo}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default DetalleCuenta;
