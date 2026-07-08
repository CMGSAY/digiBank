// presupuesto.routes.js - Rutas para control de Presupuestos y Finanzas Personales (Express)

const express = require('express');
const router = express.Router();
const presupuestoController = require('../controllers/presupuesto.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { exigirRoles } = require('../middlewares/rbac.middleware');

// Proteger todas las rutas bajo autenticación y rol de CLIENTE
router.use(verificarToken);
router.use(exigirRoles(['CLIENTE']));

// Rutas de Presupuesto
router.get('/', presupuestoController.obtenerPresupuesto);
router.post('/limites', presupuestoController.guardarLimites);

module.exports = router;
