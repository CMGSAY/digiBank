// prestamo.routes.js - Rutas para Gestión y Pago de Préstamos Bancarios

const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamo.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { exigirRoles } = require('../middlewares/rbac.middleware');

// Validar que el cliente tenga sesión activa antes de cualquier acción
router.use(verificarToken);

// Rutas de Préstamos
router.get('/', exigirRoles(['CLIENTE']), prestamoController.listarPrestamos);
router.post('/solicitar', exigirRoles(['CLIENTE']), prestamoController.solicitar);
router.post('/:id/pagar', exigirRoles(['CLIENTE']), prestamoController.pagar);

module.exports = router;
