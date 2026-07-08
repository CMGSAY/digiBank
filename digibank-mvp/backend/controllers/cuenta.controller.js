// Controlador para Cuentas Bancarias MySQL

const cuentaModel = require('../models/cuenta.model');

/**
 * Listar las cuentas monetarias y de ahorro del usuario autenticado.
 */
async function listarCuentasPropia(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const cuentas = await cuentaModel.obtenerPorUsuario(idUsuario);

    return res.status(200).json({
      success: true,
      data: cuentas
    });
  } catch (error) {
    console.error('Error en listarCuentasPropia controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al consultar cuentas.' }
    });
  }
}

/**
 * Obtener la información detallada de una cuenta (saldos, titular, reservas).
 */
async function obtenerDetalle(req, res) {
  try {
    const idCuenta = req.params.id;
    const idUsuario = req.user.id_usuario;
    const rolUsuario = req.user.rol;

    const detalle = await cuentaModel.obtenerDetalleCuenta(idCuenta, idUsuario, rolUsuario);
    if (!detalle) {
      return res.status(404).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_FOUND', message: 'Cuenta no encontrada.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: detalle
    });
  } catch (error) {
    console.error('Error en obtenerDetalle controller:', error);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: error.message }
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al consultar el detalle de la cuenta.' }
    });
  }
}

async function validarCuenta(req, res) {
  try {
    const { numeroCuenta } = req.params;
    const titular = await cuentaModel.obtenerTitularPorNumero(numeroCuenta);

    if (!titular) {
      return res.status(404).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_FOUND', message: 'La cuenta destino no existe.' }
      });
    }

    const { nombres, apellidos } = titular;
    const nombrePrincipal = nombres.split(' ')[0].toUpperCase();
    const apellidoPrincipal = apellidos.split(' ')[0].toUpperCase();
    const nombreEnmascarado = `${nombrePrincipal} ${apellidoPrincipal.charAt(0)}***`;

    return res.status(200).json({
      success: true,
      data: {
        titular: nombreEnmascarado
      }
    });

  } catch (error) {
    console.error('Error en validarCuenta controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al validar la cuenta.' }
    });
  }
}

module.exports = {
  listarCuentasPropia,
  obtenerDetalle,
  validarCuenta
};

