// Rutas para el Módulo de Autenticación de DigiBank MVP

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Endpoint para login con token de Google o Mock
router.post('/google', authController.loginGoogle);

// Endpoint para cerrar sesión
router.post('/logout', authController.logout);

// Endpoint para obtener información del usuario actual
router.get('/me', verificarToken, authController.obtenerPerfilActual);

// Endpoint para cambiar contraseña
router.post('/cambiar-password', verificarToken, authController.cambiarPassword);

// Endpoint público para registro de nuevos asociados
router.post('/registro', authController.crearClientePublico);

module.exports = router;
