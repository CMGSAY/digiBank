// notificacion.routes.js - Rutas de Notificaciones API

const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacion.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación válida
router.use(verificarToken);

// Listar notificaciones
router.get('/', notificacionController.listarNotificaciones);

// Marcar notificación individual como leída
router.put('/:id/leido', notificacionController.marcarLeido);

// Marcar todas como leídas
router.put('/leido-todas', notificacionController.marcarTodasLeidas);

module.exports = router;
