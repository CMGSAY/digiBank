// divisas.controller.js - Controlador para tipo de cambio (usa tasaCambio.service internamente)

const { obtenerTasaActual } = require('../services/tasaCambio.service');

/**
 * Obtener tipo de cambio del día (Dólar a Quetzal) desde el Banco de Guatemala.
 * La lógica de la llamada SOAP y el fallback viven en tasaCambio.service.js.
 */
async function obtenerTipoCambioActual(req, res) {
  try {
    const tasa = await obtenerTasaActual();

    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaHoy = `${dia}/${mes}/${anio}`;

    return res.status(200).json({
      success: true,
      data: {
        fecha: fechaHoy,
        referencia: tasa.compra,
        compra: tasa.compra,
        venta: tasa.venta
      }
    });
  } catch (error) {
    console.error('Error al obtener tipo de cambio:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'EXCHANGE_RATE_ERROR', message: 'No se pudo obtener el tipo de cambio.' }
    });
  }
}

module.exports = {
  obtenerTipoCambioActual
};
