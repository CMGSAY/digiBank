// Login.jsx - Página de Login de DigiBank MVP (Estilo Corporativo Claro)

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, User, Lock, ShieldCheck, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';

function Login() {
  const { loginConGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    logout();
  }, []);
  
  // Estados para Login
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  // Estados para Registro
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDpi, setRegDpi] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMoneda, setRegMoneda] = useState('GTQ');
  const [montoApertura, setMontoApertura] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const abrirModal = (titulo, contenido) => {
    setModalTitle(titulo);
    setModalContent(contenido);
    setModalOpen(true);
  };

  const expiroSesion = searchParams.get('session_expired') === 'true';

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    
    try {
      const res = await loginConGoogle(usuario, contrasena);
      if (res && res.exitoso) {
        const rol = res.usuario.rol;
        if (rol === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (rol === 'TRABAJADOR_OPERACIONES') {
          navigate('/worker/caja');
        } else if (rol === 'TRABAJADOR_SOPORTE') {
          navigate('/worker/soporte');
        } else {
          navigate('/banca/resumen');
        }
      } else {
        setError('No se pudo establecer la sesión con el servidor local.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Error al conectar con el servidor local.');
    } finally {
      setCargando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    if (regDpi.length !== 13 || isNaN(regDpi)) {
      setError('El DPI debe tener exactamente 13 dígitos numéricos.');
      setCargando(false);
      return;
    }

    try {
      const res = await axiosInstance.post('/auth/registro', {
        nombres: nombre,
        apellidos: apellido,
        email: regEmail,
        dpi: regDpi,
        password: regPassword,
        moneda: regMoneda
      });

      if (res.data && res.data.success) {
        abrirModal('¡Registro Exitoso!', 'Tu cuenta ha sido creada correctamente en DigiBank. Ahora puedes iniciar sesión con tus credenciales.');
        setModoRegistro(false);
        // Limpiar campos
        setNombre('');
        setApellido('');
        setRegEmail('');
        setRegDpi('');
        setRegPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Error al procesar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Mitad Izquierda - Banner Promocional */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 relative items-center justify-center border-r border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
        
        <div className="relative z-10 p-16 max-w-xl text-center">
          <h2 className="text-4xl font-medium text-slate-800 leading-snug mb-6">
            Con <span className="font-bold text-[#003B7A]">DigiBank Token</span> podrás
            adicionar cuentas nuevas de terceros, 
            cuentas de otros Bancos y realizar otras transacciones
            de la forma más segura
          </h2>
          <div className="mt-12 inline-flex items-center justify-center p-6 bg-white rounded-3xl shadow-xl">
            <ShieldCheck className="w-16 h-16 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Mitad Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        
        {/* Logo Superior */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3">
            <Landmark className="w-12 h-12 text-[#003B7A]" />
            <h1 className="text-4xl font-extrabold tracking-tight text-[#003B7A]">DigiBank</h1>
          </div>
          <p className="text-sm text-[#00A4E0] font-medium mt-2">Juntos, siempre hacia adelante</p>
        </div>

        {/* Alertas */}
        {expiroSesion && (
          <div className="w-full max-w-sm p-4 mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-sm flex gap-2 items-center">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Tu sesión ha expirado por inactividad. Ingresa nuevamente.</span>
          </div>
        )}

        {error && (
          <div className="w-full max-w-sm p-4 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex gap-2 items-center">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tarjeta del Formulario */}
        <div className="w-full max-w-sm bg-[#003B7A] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6">
            {!modoRegistro ? (
              // VISTA LOGIN
              <>
                <h3 className="text-center text-white font-medium mb-6">Banca de Personas</h3>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-white text-sm font-medium ml-1">Usuario / Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        placeholder="Usuario"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border-none rounded-lg focus:ring-2 focus:ring-[#00A4E0] outline-none text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white text-sm font-medium ml-1">Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border-none rounded-lg focus:ring-2 focus:ring-[#00A4E0] outline-none text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="w-full py-2.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#003B7A] transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                      {cargando ? 'Validando...' : 'Iniciar sesión'}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-6 space-y-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); abrirModal('Recuperación de Acceso', 'Para recuperar o restablecer tu clave de DigiBank en línea, comunícate a nuestra línea de soporte PBX al 1702-DIGI (1702-3444) o visita tu agencia más cercana presenting tu documento de identificación (DPI).'); }}
                    className="block w-full text-blue-200 hover:text-white text-sm transition-colors bg-transparent border-none outline-none cursor-pointer"
                  >
                    Olvidé mi contraseña
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); setModoRegistro(true); setError(null); }}
                    className="block w-full text-[#00A4E0] hover:text-white text-sm font-bold transition-colors bg-transparent border-none outline-none cursor-pointer mt-2"
                  >
                    ¿No tienes una cuenta? Regístrate aquí
                  </button>
                </div>
              </>
            ) : (
              // VISTA REGISTRO (CREAR CUENTA)
              <>
                <h3 className="text-center text-white font-medium mb-4 flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" /> Abrir Cuenta en Línea
                </h3>
                
                <form onSubmit={handleRegistro} className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <div className="space-y-0.5">
                    <label className="text-white text-xs font-semibold ml-1">Nombres</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombres"
                      className="w-full px-3 py-1.5 bg-white border-none rounded-lg outline-none text-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-white text-xs font-semibold ml-1">Apellidos</label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Apellidos"
                      className="w-full px-3 py-1.5 bg-white border-none rounded-lg outline-none text-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-white text-xs font-semibold ml-1">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3 py-1.5 bg-white border-none rounded-lg outline-none text-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-white text-xs font-semibold ml-1">DPI (13 dígitos)</label>
                    <input
                      type="text"
                      value={regDpi}
                      onChange={(e) => setRegDpi(e.target.value)}
                      placeholder="DPI sin espacios"
                      maxLength={13}
                      className="w-full px-3 py-1.5 bg-white border-none rounded-lg outline-none text-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-white text-xs font-semibold ml-1">Contraseña</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-3 py-1.5 bg-white border-none rounded-lg outline-none text-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-white text-xs font-semibold ml-1">Moneda Cuenta</label>
                    <select
                      value={regMoneda}
                      onChange={(e) => setRegMoneda(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border-none rounded-lg outline-none text-slate-800 text-sm font-semibold"
                      required
                    >
                      <option value="GTQ">Quetzales (GTQ)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70 text-sm"
                    >
                      {cargando ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <button 
                    onClick={(e) => { e.preventDefault(); setModoRegistro(false); setError(null); }}
                    className="text-blue-200 hover:text-white text-xs font-semibold transition-colors bg-transparent border-none outline-none cursor-pointer"
                  >
                    Volver al Inicio de Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tarjeta de Tips de Seguridad */}
        <button 
          onClick={() => abrirModal('Consejos de Seguridad Bancaria', '1. DigiBank NUNCA te solicitará contraseñas, tokens o información confidencial por teléfono, correo o mensaje.\n\n2. Asegúrate de que la barra de direcciones comience con https:// y el dominio oficial del banco.\n\n3. Cambia tu clave periódicamente y evita usar números predecibles.\n\n4. Cierra tu sesión siempre al finalizar tus consultas.')}
          className="w-full max-w-sm mt-4 bg-[#003B7A] hover:bg-blue-900 rounded-2xl p-5 flex items-start gap-4 shadow-lg text-left transition-colors cursor-pointer border-none outline-none"
        >
          <ShieldCheck className="w-8 h-8 text-white shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium text-sm">TIPS DE SEGURIDAD Y AYUDA</h4>
            <p className="text-blue-100 text-xs mt-1 leading-relaxed">
              Ingresa aquí para conocer tips de seguridad y ayuda con tu banca en línea.
            </p>
          </div>
        </button>

      </div>

      {/* Modal de Información Dinámico */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-[#003B7A]">{modalTitle}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{modalContent}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 bg-[#003B7A] hover:bg-blue-900 text-white rounded-full font-bold text-sm transition-colors shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;