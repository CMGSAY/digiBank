// GestionUsuarios.jsx - Gestión de Colaboradores y Nómina (Estilo Corporativo Premium)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, CheckCircle2, ShieldAlert } from 'lucide-react';

function GestionUsuarios() {
  const { usuario } = useAuth();
  const [personal, setPersonal] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('EMPLEADO');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const cargarPersonal = async () => {
    try {
      setCargando(true);
      const res = await axiosInstance.get('/admin/personal');
      if (res.data && res.data.success) {
        setPersonal(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar personal:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPersonal();
  }, []);

  const registrarPersonal = async (e) => {
    e.preventDefault();
    if (!nombre || !apellido || !email || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setExito('');
    setError('');

    try {
      setCargando(true);
      const res = await axiosInstance.post('/admin/personal', {
        nombres: nombre,
        apellidos: apellido,
        email: email,
        rol: rol,
        password: password
      });
      if (res.data && res.data.success) {
        setExito(`¡Colaborador ${nombre} registrado exitosamente!`);
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
        cargarPersonal();
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al registrar colaborador.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col bg-slate-50">
          <div className="max-w-5xl mx-auto w-full pb-10 space-y-6">
            
            <div>
              <h1 className="text-2xl font-extrabold text-[#003B7A] tracking-tight">Gestión de Personal y Nómina</h1>
              <p className="text-sm text-slate-500 mt-1">Registrar empleados de ventanilla y administradores del banco</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Formulario Registro */}
              <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <UserPlus className="w-5 h-5 text-[#003B7A]" />
                  <h3 className="text-sm font-bold text-[#003B7A] uppercase tracking-wider">Registrar Colaborador</h3>
                </div>
                
                <form onSubmit={registrarPersonal} className="space-y-4">
                  {exito && (
                    <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{exito}</span>
                    </div>
                  )}
                  {error && (
                    <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Nombres</label>
                    <input
                      type="text"
                      placeholder="Nombres del empleado"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Apellidos</label>
                    <input
                      type="text"
                      placeholder="Apellidos del empleado"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Email Institucional</label>
                    <input
                      type="email"
                      placeholder="correo@digibank.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Rol Bancario</label>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm font-semibold text-slate-800"
                    >
                      <option value="EMPLEADO">TRABAJADOR_OPERACIONES</option>
                      <option value="GERENTE">GERENTE (ADMIN)</option>
                      <option value="TRABAJADOR_SOPORTE">TRABAJADOR_SOPORTE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 text-xs font-semibold block">Contraseña Genérica (Deberá cambiarla al entrar)</label>
                    <input
                      type="password"
                      placeholder="Contraseña genérica inicial"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00A4E0] text-sm text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full py-2.5 bg-[#003B7A] hover:bg-blue-900 text-white font-bold rounded-xl shadow transition-all text-xs"
                  >
                    {cargando ? 'Procesando...' : 'Registrar Colaborador'}
                  </button>
                </form>
              </div>

              {/* Listado de Nómina */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Users className="w-5 h-5 text-[#003B7A]" />
                  <h3 className="text-sm font-bold text-[#003B7A] uppercase tracking-wider">Colaboradores Activos</h3>
                </div>
                
                {cargando ? (
                  <div className="text-slate-400 text-sm p-8 text-center italic animate-pulse">Cargando personal...</div>
                ) : personal.length === 0 ? (
                  <div className="text-slate-400 text-sm p-8 text-center italic">No hay personal registrado.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Rol</th>
                          <th className="p-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personal.map((col) => (
                          <tr key={col.id_usuario} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-bold text-slate-800">{col.nombres} {col.apellidos}</td>
                            <td className="p-3 font-mono text-xs text-slate-500">{col.email}</td>
                            <td className="p-3 font-semibold text-slate-700 text-xs">{col.rol}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">{col.estado}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;
