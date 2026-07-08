// Rutas de Cuentas Bancarias

const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuenta.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Rutas protegidas por Token de Firebase
router.get('/', verificarToken, cuentaController.listarCuentasPropia);
router.get('/validar/:numeroCuenta', verificarToken, cuentaController.validarCuenta);
router.get('/:id/detalle', verificarToken, cuentaController.obtenerDetalle);

module.exports = router;

