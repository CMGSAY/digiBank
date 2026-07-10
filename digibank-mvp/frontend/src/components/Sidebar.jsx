// Sidebar.jsx - Barra Lateral (Estilo DigiBank)

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  RefreshCw,
  Send,
  Calculator,
  Clock,
  FileText,
  PieChart,
  Users,
  UserPlus,
  ClipboardList,
  Bell,
  Lock
} from 'lucide-react';

function Sidebar() {
  const { usuario } = useAuth();
  const location = useLocation();

  // Definir ítems de menú dinámicamente según el rol del usuario
  let menuItems = [];

  if (usuario?.rol === 'ADMIN' || usuario?.rol === 'GERENTE') {
    menuItems = [
      { name: 'Balances y Liquidez', path: '/admin/dashboard', icon: Home },
      { name: 'Caja Ventanilla', path: '/worker/caja', icon: Calculator },
      { name: 'Nómina Personal', path: '/admin/usuarios', icon: Users },
      { name: 'Asignar Préstamos', path: '/admin/prestamos', icon: FileText },
      { name: 'Auditoría Logs', path: '/admin/auditoria', icon: FileText },
      { name: 'Tasas de Cambio', path: '/admin/tasas', icon: RefreshCw },
      { name: 'Notificaciones', path: '/admin/notificaciones', icon: Bell },
      { name: 'Seguridad', path: '/seguridad', icon: Lock }
    ];
  } else if (usuario?.rol === 'TRABAJADOR_OPERACIONES') {
    menuItems = [
      { name: 'Caja Ventanilla', path: '/worker/caja', icon: Calculator },
      { name: 'Historial Caja', path: '/worker/historial-caja', icon: ClipboardList },
      { name: 'Aprobación Préstamos', path: '/worker/prestamos', icon: FileText },
      { name: 'Registrar Asociado', path: '/worker/clientes', icon: UserPlus },
      { name: 'Notificaciones', path: '/worker/notificaciones', icon: Bell },
      { name: 'Seguridad', path: '/seguridad', icon: Lock }
    ];
  } else {
    // Cliente
    menuItems = [
      { name: 'Inicio', path: '/banca/resumen', icon: Home },
      { name: 'Divisas', path: '/banca/divisas', icon: RefreshCw },
      { name: 'Transferencia', path: '/banca/transferencias', icon: Send },
      { name: 'Prestamo', path: '/banca/prestamos', icon: Calculator },
      { name: 'Historia transacciones', path: '/banca/historial', icon: Clock },
      { name: 'EstadoCuenta', path: '/banca/estadocuenta', icon: FileText },
      { name: 'Presupuesto', path: '/banca/presupuesto', icon: PieChart },
      { name: 'Seguridad', path: '/seguridad', icon: Lock }
    ];
  }

  return (
    <aside className="w-full md:w-64 bg-[#154360] flex flex-row md:flex-col shrink-0 shadow-2xl z-20 overflow-x-auto md:overflow-x-visible md:h-screen">
      
      {/* Bloque Superior - Usuario (Azul más claro) */}
      <div className="bg-[#2874A6] h-20 px-6 flex flex-col justify-center border-b border-[#1b4f72]">
        <span className="text-sm text-blue-100 font-bold uppercase tracking-wider block opacity-75">
          {usuario?.rol === 'ADMIN' ? 'Gerente General' : (usuario?.rol === 'TRABAJADOR_OPERACIONES' ? 'Empleado de Ventanilla' : 'Cliente Digital')}
        </span>
        <span className="text-base font-bold text-white tracking-wide truncate mt-0.5">
          {usuario?.nombres ? usuario.nombres.split(' ')[0] : 'Invitado'}
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 md:py-6 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto items-center md:items-stretch px-4 md:px-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const esActivo = location.pathname === item.path || 
            (item.name === 'Inicio' && location.pathname === '/banca/resumen');
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-2.5 md:py-4 text-xs md:text-sm transition-colors border-b-2 md:border-b-0 md:border-l-4 whitespace-nowrap ${
                esActivo 
                  ? 'bg-[#1a5276] text-white border-white font-bold shadow-inner' 
                  : 'text-blue-100 hover:bg-[#1a5276] hover:text-white border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 opacity-80" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;