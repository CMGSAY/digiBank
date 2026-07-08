// Rutas de Beneficiarios (Cuentas Frecuentes de Terceros)

const express = require('express');
const router = express.Router();
const beneficiarioController = require('../controllers/beneficiario.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Rutas protegidas
router.use(verificarToken);

router.get('/', beneficiarioController.listarBeneficiarios);
router.post('/', beneficiarioController.crearBeneficiario);
router.delete('/:id', beneficiarioController.eliminarBeneficiario);

module.exports = router;
