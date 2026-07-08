// Rutas de Transacciones Financieras (Banca en Línea)

const express = require('express');
const router = express.Router();

const transaccionController = require('../controllers/transaccion.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { exigirRoles } = require('../middlewares/rbac.middleware');
const { registrarAuditoria } = require('../middlewares/audit.middleware');
const { limiterOperaciones } = require('../middlewares/rateLimiter.middleware');

// Todas las operaciones bancarias requieren sesión verificada
router.use(verificarToken);

// Realizar transferencias entre cuentas (propias o a terceros)
// NOTA: Endpoint único consolidado. Acepta { cuenta_origen, cuenta_destino, monto, tipo }
router.post(
  '/transferencia',
  exigirRoles(['CLIENTE']),
  limiterOperaciones,
  registrarAuditoria('TRANSFERENCIA'),
  transaccionController.realizarTransferencia
);

// Realizar conversión de monedas entre cuentas propias
router.post(
  '/conversion',
  exigirRoles(['CLIENTE']),
  limiterOperaciones,
  registrarAuditoria('CONVERSION_DIVISAS'),
  transaccionController.realizarConversion
);

// Obtener historial financiero paginado (Clientes, Soporte o Admin)
router.get(
  '/historial',
  exigirRoles(['CLIENTE', 'TRABAJADOR_SOPORTE', 'ADMIN']),
  transaccionController.obtenerHistorial
);

// Obtener historial filtrado por mes/año para una cuenta específica
router.get(
  '/historial/:idCuenta',
  exigirRoles(['CLIENTE', 'TRABAJADOR_SOPORTE', 'ADMIN']),
  transaccionController.obtenerHistorialPorMes
);

module.exports = router;
