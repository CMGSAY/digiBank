// EstadoCuenta.jsx - Vista de Estado de Cuenta Formal (Estilo Banco Industrial)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerCuentasUsuario } from '../../services/cuenta.service';
import { obtenerHistorialPorMes } from '../../services/transaccion.service';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Info } from 'lucide-react';

function EstadoCuenta() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // Estados locales
  const [cuentas, setCuentas] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [saldoInicial, setSaldoInicial] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [cargandoMovs, setCargandoMovs] = useState(false);
  const [error, setError] = useState(null);

  // Parámetros de mes y año actuales
  const hoy = new Date();
  const mesActualStr = String(hoy.getMonth() + 1).padStart(2, '0');
  const anioActualStr = String(hoy.getFullYear());

  // Auditoría inferior
  const [fechaImpresion, setFechaImpresion] = useState('');
  const [horaImpresion, setHoraImpresion] = useState('');
  const [autorizacionNo] = useState('1235467470'); // Número estático según especificación

  // Modal para detalle de transacción individual
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

  // Cargar Cuentas del Usuario
  useEffect(() => {
    // Generar datos dinámicos de auditoría
    const ahora = new Date();
    const diaStr = String(ahora.getDate()).padStart(2, '0');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesStr = meses[ahora.getMonth()];
    const anioStr = ahora.getFullYear();
    setFechaImpresion(`${diaStr} - ${mesStr} - ${anioStr}`);

    let horas = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    horas = horas % 12;
    horas = horas ? horas : 12;
    setHoraImpresion(`${String(horas).padStart(2, '0')}:${minutos}:${segundos} ${ampm}`);

    const cargarCuentas = async () => {
      try {
        setCargando(true);
        setError(null);
        const res = await obtenerCuentasUsuario();
        if (res && res.success) {
          setCuentas(res.data);
          if (res.data.length > 0) {
            setCuentaSeleccionada(res.data[0]);
          }
        } else {
          setError('No se pudieron obtener las cuentas del usuario.');
        }
      } catch (err) {
        console.error('Error al cargar cuentas:', err);
        setError('Error al comunicarse con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    cargarCuentas();
  }, []);

  // Cargar Movimientos de la Cuenta Seleccionada
  useEffect(() => {
    const cargarMovimientos = async () => {
      if (!cuentaSeleccionada) return;
      try {
        setCargandoMovs(true);
        const res = await obtenerHistorialPorMes(cuentaSeleccionada.id_cuenta, mesActualStr, anioActualStr);
        if (res && res.success) {
          // Calcular saldos históricos en reversa
          let saldoAcumulado = parseFloat(cuentaSeleccionada.saldo);
          const txsCalculadas = [...res.data].map(t => {
            const esDebito = t.id_cuenta_origen === cuentaSeleccionada.id_cuenta;
            const cambio = esDebito ? -parseFloat(t.monto_origen) : parseFloat(t.monto_destino);
            const saldoLinea = saldoAcumulado;
            saldoAcumulado = saldoAcumulado - cambio;
            return {
              ...t,
              esDebito,
              saldoLinea
            };
          });

          setSaldoInicial(saldoAcumulado);
          setMovimientos(txsCalculadas);
        }
      } catch (err) {
        console.error('Error al cargar movimientos:', err);
      } finally {
        setCargandoMovs(false);
      }
    };

    cargarMovimientos();
  }, [cuentaSeleccionada]);

  const nombreMes = (numeroMes) => {
    const meses = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    return meses[numeroMes] || 'Seleccionado';
  };

  // Nombre de cuenta dinámico del titular
  const nombreTitular = cuentaSeleccionada?.nombre_titular || 
    (usuario ? `${usuario.nombres} ${usuario.apellidos || ''}`.toUpperCase() : 'CARLOS ORTIZ');

  // Render condicional seguro
  if (cargando) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-[#003B7A] font-bold text-lg animate-pulse">Cargando estado de cuenta...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
              <p className="font-bold text-lg mb-2">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor Derecho */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden bg-white">
        
        {/* Navbar */}
        <Navbar />

        <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-800 flex flex-col">

          <div className="max-w-5xl mx-auto w-full pb-10 flex flex-col flex-1 space-y-6">
            
            {/* Encabezado y Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-300">
              <div>
                <h2 className="text-2xl font-bold text-[#003B7A]">Monetarias</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Estado de cuenta del mes: {nombreMes(mesActualStr)}
                </p>
              </div>

              {/* Selector de cuenta */}
              <div className="flex flex-wrap items-center gap-2 text-sm self-stretch md:self-auto">
                <span className="text-slate-600 font-bold">Seleccionar Cuenta:</span>
                <select
                  value={cuentaSeleccionada?.id_cuenta || ''}
                  onChange={(e) => {
                    const cuenta = cuentas.find(c => c.id_cuenta === parseInt(e.target.value));
                    setCuentaSeleccionada(cuenta);
                  }}
                  className="border border-slate-300 bg-slate-50 px-3 py-1.5 rounded-none outline-none font-semibold text-slate-700"
                >
                  {cuentas.map(c => (
                    <option key={c.id_cuenta} value={c.id_cuenta}>
                      {c.numero_cuenta} ({c.tipo_cuenta})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bloque Superior de Leyendas (Contenedor gris claro con leyenda) */}
            <div className="bg-slate-100 border border-slate-300 p-3 text-xs text-slate-700 rounded-none">
              DE= Depósito, NC= Nota de crédito, CQ= Pago de cheque, ND= Nota de débito
            </div>

            {/* Información de Cuenta */}
            {cuentaSeleccionada && (
              <section className="bg-white border border-slate-200 p-5 rounded-none space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                  <div className="flex gap-4">
                    <span className="text-slate-500 w-36 font-semibold">Nombre de cuenta:</span>
                    <span className="text-slate-800 font-bold">{nombreTitular}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 w-36 font-semibold">No. de cuenta:</span>
                    <span className="text-slate-800 font-mono font-bold">{cuentaSeleccionada.numero_cuenta}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 w-36 font-semibold">Saldo inicial:</span>
                    <span className="text-[#00A4E0] font-extrabold font-mono">
                      {cuentaSeleccionada.simbolo} {saldoInicial.toFixed(2)}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Tabla de Movimientos */}
            <section className="bg-white border border-slate-200 rounded-none overflow-hidden">
              {cargandoMovs ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Cargando movimientos...
                </div>
              ) : movimientos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No hay transacciones registradas para este periodo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#003B7A] text-white text-xs font-bold uppercase tracking-wider text-center">
                        <th className="p-3 border-r border-[#002752] w-24">FECHA</th>
                        <th className="p-3 border-r border-[#002752] w-28">TRANSACCIÓN</th>
                        <th className="p-3 border-r border-[#002752] text-left">DESCRIPCIÓN</th>
                        <th className="p-3 border-r border-[#002752] w-32">NO. DOC</th>
                        <th className="p-3 border-r border-[#002752] w-40">DEBE</th>
                        <th className="p-3 border-r border-[#002752] w-40">HABER</th>
                        <th className="p-3 w-40">SALDO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map((m, idx) => {
                        let tipoTransaccion = 'ND';
                        if (m.tipo === 'DEPOSITO') {
                          tipoTransaccion = 'DE';
                        } else if (m.descripcion?.toUpperCase().includes('CHEQUE')) {
                          tipoTransaccion = 'CQ';
                        } else {
                          tipoTransaccion = m.esDebito ? 'ND' : 'NC';
                        }

                        return (
                          <tr 
                            key={m.id_transaccion} 
                            className={`border-b border-slate-200 hover:bg-slate-50 transition-colors text-center ${
                              idx % 2 !== 0 ? 'bg-slate-50/40' : ''
                            }`}
                          >
                            <td className="p-3 text-slate-600 font-medium border-r border-slate-200">
                              {new Date(m.fecha).toLocaleDateString('es-GT')}
                            </td>
                            <td className="p-3 border-r border-slate-200">
                              <button 
                                onClick={() => setTransaccionSeleccionada(m)}
                                className="text-[#00A4E0] hover:text-[#003B7A] font-bold underline text-sm"
                              >
                                {tipoTransaccion}
                              </button>
                            </td>
                            <td className="p-3 text-slate-700 font-medium text-left border-r border-slate-200 max-w-xs truncate">
                              {m.descripcion}
                            </td>
                            <td className="p-3 font-mono text-xs text-slate-500 border-r border-slate-200">
                              {m.numero_referencia}
                            </td>
                            <td className="p-3 border-r border-slate-200">
                              {m.esDebito ? (
                                <div className="flex justify-between w-full font-mono px-2 text-slate-700">
                                  <span>{cuentaSeleccionada.simbolo}</span>
                                  <span>{parseFloat(m.monto_origen).toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-350">-</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-200">
                              {!m.esDebito ? (
                                <div className="flex justify-between w-full font-mono px-2 text-slate-700">
                                  <span>{cuentaSeleccionada.simbolo}</span>
                                  <span>{parseFloat(m.monto_destino).toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-350">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-between w-full font-mono px-2 font-bold text-slate-800">
                                <span>{cuentaSeleccionada.simbolo}</span>
                                <span>{parseFloat(m.saldoLinea).toFixed(2)}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Botón Regresar: outline cyan alineado a la derecha */}
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => navigate(-1)}
                className="border border-[#00A4E0] text-[#00A4E0] hover:bg-[#00A4E0] hover:text-white px-8 py-2 font-semibold rounded-none transition-all text-sm"
              >
                Regresar
              </button>
            </div>

            {/* Footer de Impresión (Barra gris) */}
            <div className="bg-slate-100 border border-slate-250 text-slate-600 font-mono text-xs py-3 px-6 rounded-none flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
              <span className="font-bold">Banco Industrial, S.A.</span>
              <span>Fecha actual: {fechaImpresion}</span>
              <span>Hora actual: {horaImpresion}</span>
              <span className="font-bold">Autorización No. 1235467470</span>
            </div>

          </div>
        </div>

      </div>

      {/* Modal de Detalle de Transacción */}
      {transaccionSeleccionada && cuentaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-xl border border-slate-300 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Info className="w-5 h-5 text-[#00A4E0]" />
              <h3 className="text-lg font-bold text-[#003B7A]">Comprobante de Movimiento</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">No. Referencia:</span>
                <span className="font-mono font-semibold text-slate-800 text-right">{transaccionSeleccionada.numero_referencia}</span>
              </div>
              <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Fecha:</span>
                <span className="font-medium text-slate-800 text-right">
                  {new Date(transaccionSeleccionada.fecha).toLocaleString('es-GT')}
                </span>
              </div>
              <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Tipo:</span>
                <span className={`font-bold text-right ${transaccionSeleccionada.esDebito ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {transaccionSeleccionada.esDebito ? 'DÉBITO / RETIRO (ND)' : 'CRÉDITO / DEPÓSITO (NC)'}
                </span>
              </div>
              <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Monto:</span>
                <span className="font-extrabold text-slate-800 text-right font-mono">
                  {cuentaSeleccionada.simbolo} {parseFloat(transaccionSeleccionada.esDebito ? transaccionSeleccionada.monto_origen : transaccionSeleccionada.monto_destino).toFixed(2)}
                </span>
              </div>
              {transaccionSeleccionada.cuenta_origen && (
                <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cuenta Origen:</span>
                  <span className="font-mono text-slate-800 text-right">{transaccionSeleccionada.cuenta_origen}</span>
                </div>
              )}
              <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">Cuenta Destino:</span>
                <span className="font-mono text-slate-800 text-right">{transaccionSeleccionada.cuenta_destino}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-slate-500">Descripción:</span>
                <span className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1 italic text-xs">
                  {transaccionSeleccionada.descripcion || 'Sin descripción.'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTransaccionSeleccionada(null)}
                className="px-6 py-2 bg-[#003B7A] hover:bg-[#002752] text-white font-bold rounded-none shadow-sm text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EstadoCuenta;
