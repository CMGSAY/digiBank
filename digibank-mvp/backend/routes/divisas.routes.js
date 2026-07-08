// divisas.routes.js - Rutas para consulta de tipo de cambio / divisas

const express = require('express');
const router = express.Router();
const divisasController = require('../controllers/divisas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Endpoint para obtener tipo de cambio actual del dólar
router.get('/actual', verificarToken, divisasController.obtenerTipoCambioActual);

module.exports = router;
