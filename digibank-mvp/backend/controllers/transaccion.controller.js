// Controlador HTTP para el MÃ³dulo de Transacciones Financieras

const transaccionService = require('../services/transaccion.service');
const transaccionModel = require('../models/transaccion.model');

/**
 * Endpoint unificado de transferencias.
 * Acepta el payload del frontend: { cuenta_origen, cuenta_destino, monto, tipo }
 *   - tipo === 'propia'  : cuenta_destino es un ID numÃ©rico (entre cuentas propias)
 *   - tipo === 'ajena'   : cuenta_destino es un nÃºmero de cuenta string (a terceros)
 * Delega la lÃ³gica ACID al transaccion.service cuando las monedas coinciden.
 * Aplica conversiÃ³n vÃ­a tipo de cambio Banguat cuando las monedas difieren.
 */
async function realizarTransferencia(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { cuenta_origen, cuenta_destino, monto, tipo, descripcion } = req.body;

    const montoNum = parseFloat(monto);
    if (!cuenta_origen || !cuenta_destino || isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Datos incompletos o monto invÃ¡lido.' }
      });
    }

    if (cuenta_origen === cuenta_destino) {
      return res.status(400).json({
        success: false,
        error: { code: 'SAME_ACCOUNT', message: 'La cuenta de origen y destino no pueden ser la misma.' }
      });
    }

    // Transferencia a terceros (tipo === 'ajena'): el destino es nÃºmero de cuenta string
    // Delegar al servicio ACID que incluye bloqueo anti-deadlock
    if (tipo === 'ajena' || !tipo) {
      const resultado = await transaccionService.ejecutarTransferencia(
        cuenta_origen,
        cuenta_destino,   // numero_cuenta string
        montoNum,
        descripcion || 'Transferencia a terceros',
        idUsuario
      );

      if (!resultado.exitoso) {
        return res.status(resultado.status || 422).json({
          success: false,
          error: { code: resultado.error_code, message: resultado.mensaje }
        });
      }

      return res.status(201).json({
        success: true,
        data: resultado.transaccion
      });
    }

    // Transferencia propia (tipo === 'propia'): el destino es un ID numÃ©rico
    // Usar servicio de conversiÃ³n ya que puede involucrar GTQ <-> USD
    const { pool } = require('../config/db.config');
    const { obtenerTasaActual } = require('../services/tasaCambio.service');

    const queryCuenta = `
      SELECT c.id_cuenta, c.id_usuario, c.id_moneda, m.codigo_iso, c.estado, c.saldo 
      FROM CUENTAS c 
      JOIN MONEDAS m ON c.id_moneda = m.id_moneda 
      WHERE c.id_cuenta = ?`;

    const [origenRows] = await pool.execute(queryCuenta, [cuenta_origen]);
    const [destinoRows] = await pool.execute(queryCuenta, [cuenta_destino]);

    if (origenRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'SOURCE_ACCOUNT_NOT_FOUND', message: 'La cuenta origen no existe.' } });
    }
    if (destinoRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'DESTINATION_ACCOUNT_NOT_FOUND', message: 'La cuenta destino no existe.' } });
    }

    const cuentaOrigen = origenRows[0];
    const cuentaDestino = destinoRows[0];

    if (cuentaOrigen.id_usuario !== idUsuario) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN_OWNERSHIP', message: 'La cuenta origen no le pertenece.' } });
    }
    if (cuentaOrigen.estado !== 'ACTIVA' || cuentaDestino.estado !== 'ACTIVA') {
      return res.status(400).json({ success: false, error: { code: 'INACTIVE_ACCOUNT', message: 'Una de las cuentas involucradas no estÃ¡ activa.' } });
    }

    const tasas = await obtenerTasaActual();
    let montoASumar = montoNum;
    let notaTC = '';

    if (cuentaOrigen.codigo_iso === 'GTQ' && cuentaDestino.codigo_iso === 'USD') {
      montoASumar = Number((montoNum / tasas.venta).toFixed(2));
      notaTC = ` (TC Venta: ${tasas.venta})`;
    } else if (cuentaOrigen.codigo_iso === 'USD' && cuentaDestino.codigo_iso === 'GTQ') {
      montoASumar = Number((montoNum * tasas.compra).toFixed(2));
      notaTC = ` (TC Compra: ${tasas.compra})`;
    }

    const [idMenor, idMayor] = [cuentaOrigen.id_cuenta, cuentaDestino.id_cuenta].sort((a, b) => a - b);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('SELECT saldo FROM CUENTAS WHERE id_cuenta = ? FOR UPDATE', [idMenor]);
      await connection.execute('SELECT saldo FROM CUENTAS WHERE id_cuenta = ? FOR UPDATE', [idMayor]);

      const [saldoRow] = await connection.execute('SELECT saldo FROM CUENTAS WHERE id_cuenta = ?', [cuentaOrigen.id_cuenta]);
      const saldoActual = parseFloat(saldoRow[0].saldo);

      if (saldoActual < montoNum) {
        await connection.rollback();
        return res.status(422).json({ success: false, error: { code: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente.' } });
      }

      const [saldoDestinoRow] = await connection.execute('SELECT saldo FROM CUENTAS WHERE id_cuenta = ?', [cuentaDestino.id_cuenta]);
      const nuevoSaldoOrigen = Number((saldoActual - montoNum).toFixed(2));
      const nuevoSaldoDestino = Number((parseFloat(saldoDestinoRow[0].saldo) + montoASumar).toFixed(2));

      await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoOrigen, cuentaOrigen.id_cuenta]);
      await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoDestino, cuentaDestino.id_cuenta]);

      const numeroReferencia = `TX-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;
      await connection.execute(
        `INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
         VALUES (?, ?, ?, ?, NULL, 'TRANSFERENCIA', ?, ?, 'COMPLETADA', NOW())`,
        [cuentaOrigen.id_cuenta, cuentaDestino.id_cuenta, montoNum, montoASumar, `Transf. entre cuentas propias${notaTC}`, numeroReferencia]
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        data: { numero_referencia: numeroReferencia, monto_origen: montoNum, monto_destino: montoASumar, fecha: new Date() }
      });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en realizarTransferencia controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al procesar la transferencia.' }
    });
  }
}


async function realizarConversion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_cuenta_origen, id_cuenta_destino, monto_origen } = req.body;

    if (!id_cuenta_origen || !id_cuenta_destino || !monto_origen || monto_origen <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Datos incompletos o monto de origen invÃ¡lido.' }
      });
    }

    const resultado = await transaccionService.ejecutarConversion(
      id_cuenta_origen,
      id_cuenta_destino,
      monto_origen,
      idUsuario
    );

    if (!resultado.exitoso) {
      return res.status(resultado.status || 422).json({
        success: false,
        error: { code: resultado.error_code, message: resultado.mensaje }
      });
    }

    return res.status(201).json({
      success: true,
      data: resultado.transaccion
    });

  } catch (error) {
    console.error('Error en realizarConversion controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al procesar la conversiÃ³n.' }
    });
  }
}

async function obtenerHistorial(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const rolUsuario = req.user.rol;
    const { id_cuenta, page, limit } = req.query;

    if (!id_cuenta) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Falta especificar la cuenta en los parÃ¡metros.' }
      });
    }

    const resultado = await transaccionService.obtenerHistorial(id_cuenta, idUsuario, rolUsuario, { page, limit });

    if (!resultado.exitoso) {
      return res.status(resultado.status || 400).json({
        success: false,
        error: { code: 'FETCH_FAILED', message: resultado.mensaje }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        transacciones: resultado.transacciones,
        paginacion: resultado.paginacion
      }
    });

  } catch (error) {
    console.error('Error en obtenerHistorial controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al obtener el historial.' }
    });
  }
}

async function obtenerHistorialPorMes(req, res) {
  try {
    const idCuenta = req.params.idCuenta;
    const idUsuario = req.user.id_usuario;
    const rolUsuario = req.user.rol;
    
    // Obtener mes y aÃ±o de consulta. Por defecto usar mes y aÃ±o actual.
    const ahora = new Date();
    const mes = req.query.mes || String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = req.query.anio || String(ahora.getFullYear());

    const transacciones = await transaccionModel.obtenerHistorialPorMes(
      idCuenta, 
      idUsuario, 
      rolUsuario, 
      mes, 
      anio
    );

    return res.status(200).json({
      success: true,
      data: transacciones
    });

  } catch (error) {
    console.error('Error en obtenerHistorialPorMes controller:', error);
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: error.message }
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al obtener el historial de transacciones.' }
    });
  }
}

module.exports = {
  realizarTransferencia,
  realizarConversion,
  obtenerHistorial,
  obtenerHistorialPorMes
};
