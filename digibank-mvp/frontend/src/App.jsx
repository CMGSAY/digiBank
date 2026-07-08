// App.jsx - Ruteador Principal de DigiBank MVP

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importación de Páginas
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/client/Dashboard';
import Foro from './pages/client/Foro';
import Historial from './pages/client/Historial';
import Prestamos from './pages/client/Prestamos';
import PagarPrestamo from './pages/client/PagarPrestamo';
import SolicitudPrestamo from './pages/client/SolicitudPrestamo';
import Beneficiarios from './pages/client/Beneficiarios';
import DetalleCuenta from './pages/client/DetalleCuenta';
import EstadoCuenta from './pages/client/EstadoCuenta';
import Divisas from './pages/client/Divisas';
import FinanzasPersonales from './pages/client/FinanzasPersonales';
import Transferencias from './pages/client/Transferencias';
import AdminDashboard from './pages/admin/Dashboard';
import AuditLog from './pages/admin/AuditLog';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import TasasCambio from './pages/admin/TasasCambio';
import AsignarPrestamos from './pages/admin/AsignarPrestamos';
import CajaVentanilla from './pages/worker/CajaVentanilla';
import HistorialCaja from './pages/worker/HistorialCaja';
import PrestamosAsignados from './pages/worker/PrestamosAsignados';
import RegistrarCliente from './pages/worker/RegistrarCliente';
import PanelSoporte from './pages/worker/PanelSoporte';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Guard para proteger rutas y exigir sesión activa
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas Privadas del Cliente Financiero */}
          <Route 
            path="/banca/resumen" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Dashboard />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/cuenta/:id" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <DetalleCuenta />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/estadocuenta" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <EstadoCuenta />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/divisas" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Divisas />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/foro" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Foro />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/historial" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Historial />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/prestamos" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Prestamos />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/prestamos/pagar" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <PagarPrestamo />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/prestamos/solicitar" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <SolicitudPrestamo />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/beneficiarios" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Beneficiarios />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/presupuesto" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <FinanzasPersonales />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/banca/transferencias" 
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE']}>
                <Transferencias />
              </RutaProtegida>
            } 
          />

          {/* Rutas Privadas del Administrador */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <AdminDashboard />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/admin/auditoria" 
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <AuditLog />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/admin/usuarios" 
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <GestionUsuarios />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/admin/tasas" 
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <TasasCambio />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/admin/prestamos" 
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <AsignarPrestamos />
              </RutaProtegida>
            } 
          />

          {/* Rutas Privadas del Trabajador de Operaciones/Soporte */}
          <Route 
            path="/worker/operaciones" 
            element={
              <RutaProtegida rolesPermitidos={['TRABAJADOR_OPERACIONES', 'ADMIN']}>
                <Navigate to="/worker/caja" replace />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/worker/caja" 
            element={
              <RutaProtegida rolesPermitidos={['TRABAJADOR_OPERACIONES', 'ADMIN']}>
                <CajaVentanilla />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/worker/historial-caja" 
            element={
              <RutaProtegida rolesPermitidos={['TRABAJADOR_OPERACIONES', 'ADMIN']}>
                <HistorialCaja />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/worker/prestamos" 
            element={
              <RutaProtegida rolesPermitidos={['TRABAJADOR_OPERACIONES', 'ADMIN']}>
                <PrestamosAsignados />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/worker/clientes" 
            element={
              <RutaProtegida rolesPermitidos={['TRABAJADOR_OPERACIONES', 'ADMIN']}>
                <RegistrarCliente />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/worker/soporte" 
            element={
              <RutaProtegida rolesPermitidos={['TRABAJADOR_SOPORTE']}>
                <PanelSoporte />
              </RutaProtegida>
            } 
          />

          {/* Rutas de Error */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
