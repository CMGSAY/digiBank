// prestamo.controller.js - Controlador HTTP para la Gestión de Préstamos (Backend)

const prestamoService = require('../services/prestamo.service');
const prestamoModel = require('../models/prestamo.model');

/**
 * Listar los préstamos del usuario autenticado.
 */
async function listarPrestamos(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const prestamos = await prestamoModel.obtenerPorUsuario(idUsuario);

    return res.status(200).json({
      success: true,
      data: prestamos
    });
  } catch (error) {
    console.error('Error en listarPrestamos controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al consultar los préstamos.' }
    });
  }
}

/**
 * Solicitar un préstamo.
 */
async function solicitar(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_cuenta_desembolso, monto_solicitado, ingresos_declarados, estabilidad, telefono, descripcion } = req.body;

    if (!id_cuenta_desembolso || !monto_solicitado || !ingresos_declarados || !estabilidad) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Faltan campos obligatorios en el formulario.' }
      });
    }

    const resultado = await prestamoService.solicitarPrestamo({
      id_cuenta_desembolso: parseInt(id_cuenta_desembolso),
      monto_solicitado: parseFloat(monto_solicitado),
      ingresos_declarados: parseFloat(ingresos_declarados),
      estabilidad,
      telefono,
      descripcion
    }, idUsuario);

    if (!resultado.exitoso) {
      return res.status(resultado.status || 400).json({
        success: false,
        error: { code: resultado.error_code, message: resultado.mensaje }
      });
    }

    return res.status(201).json({
      success: true,
      data: resultado.data
    });

  } catch (error) {
    console.error('Error en solicitar préstamo controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al solicitar el préstamo.' }
    });
  }
}

/**
 * Realizar el pago de una cuota de préstamo.
 */
async function pagar(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idPrestamo = req.params.id;
    const { id_cuenta_origen } = req.body;

    if (!id_cuenta_origen) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Se requiere especificar la cuenta de origen para efectuar el pago.' }
      });
    }

    const resultado = await prestamoService.pagarCuotaPrestamo(
      parseInt(idPrestamo),
      parseInt(id_cuenta_origen),
      idUsuario
    );

    if (!resultado.exitoso) {
      return res.status(resultado.status || 422).json({
        success: false,
        error: { code: resultado.error_code, message: resultado.mensaje }
      });
    }

    return res.status(200).json({
      success: true,
      data: resultado.data
    });

  } catch (error) {
    console.error('Error en pagar préstamo controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al procesar el pago del préstamo.' }
    });
  }
}

module.exports = {
  listarPrestamos,
  solicitar,
  pagar
};
