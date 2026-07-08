const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { exigirRoles } = require('../middlewares/rbac.middleware');

// Validar token y exigir rol de Gerente/Administrador
router.use(verificarToken);
router.use(exigirRoles(['ADMIN']));

// 1. Obtener KPIs del dashboard gerencial
router.get('/dashboard/kpis', adminController.obtenerKpis);

// 2. Obtener consolidado de liquidez del banco
router.get('/dashboard/liquidez', adminController.obtenerLiquidez);

// 3. Listar y registrar personal (empleados o gerentes)
router.get('/personal', adminController.listarColaboradores);
router.post('/personal', adminController.crearColaborador);

// 4. Listar préstamos mayores (> 3000) pendientes de asignación
router.get('/prestamos/mayores', adminController.listarPrestamosMayores);

// 5. Asignar préstamo a un empleado para su revisión
router.put('/prestamos/:idPrestamo/asignar', adminController.asignarAEmpleado);

// 6. Obtener bitácora de auditoría completa de MongoDB
router.get('/auditoria', adminController.listarAuditoriaCompleta);

// 7. Configuración de Tasas de Cambio
router.get('/tasas', adminController.obtenerTasas);
router.post('/tasas', adminController.actualizarTasas);

module.exports = router;
