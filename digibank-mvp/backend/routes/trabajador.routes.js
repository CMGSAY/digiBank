const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajador.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { exigirRoles } = require('../middlewares/rbac.middleware');

// Validar token de Firebase y exigir privilegios de Trabajador o Administrador
router.use(verificarToken);
router.use(exigirRoles(['TRABAJADOR_OPERACIONES', 'ADMIN']));

// 1. Crear nuevo cliente y su cuenta bancaria
router.post('/clientes/crear', trabajadorController.crearClienteYCuenta);

// 2. Buscar cuenta por número de cuenta (para operaciones de caja)
router.get('/cuentas/:numeroCuenta', trabajadorController.buscarCuentaPorNumero);

// 3. Registrar depósito/retiro de caja (Ventanilla)
router.post('/caja/operacion', trabajadorController.procesarOperacionCaja);

// 4. Listar historial de operaciones del cajero logueado
router.get('/caja/historial', trabajadorController.listarOperacionesCaja);

// 5. Listar préstamos mayores asignados a este cajero/empleado
router.get('/prestamos/asignados', trabajadorController.listarPrestamosAsignados);

// 6. Aprobar o rechazar solicitud de préstamo
router.put('/prestamos/:idPrestamo/estado', trabajadorController.actualizarEstadoPrestamo);

// 7. Activar o desactivar cuenta bancaria
router.put('/cuentas/:idCuenta/estado', trabajadorController.actualizarEstadoCuenta);

module.exports = router;
