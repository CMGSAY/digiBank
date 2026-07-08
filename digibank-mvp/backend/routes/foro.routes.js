// Rutas del Foro Colaborativo (MongoDB)

const express = require('express');
const router = express.Router();

const foroController = require('../controllers/foro.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las llamadas al foro requieren autenticación
router.use(verificarToken);

router.get('/mensajes', foroController.obtenerMensajes);
router.post('/mensaje', foroController.crearMensajeHttp);

module.exports = router;
