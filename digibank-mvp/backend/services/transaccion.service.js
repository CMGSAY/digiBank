// Servicio Transaccional Financiero ACID con prevención de deadlocks y validación defensiva de montos

const { pool } = require('../config/db.config');

/**
 * Ejecuta una transferencia interna entre usuarios de la misma moneda (ACID).
 * Prevención de Deadlocks mediante ordenamiento de IDs de cuenta y bloqueo secuencial ascendente.
 */
async function ejecutarTransferencia(idCuentaOrigen, numeroCuentaDestino, monto, descripcion, idUsuarioPropietario) {
  const montoDebitar = parseFloat(monto);

  // Validación defensiva en capa de servicio
  if (isNaN(montoDebitar) || montoDebitar <= 0) {
    return { exitoso: false, status: 400, error_code: 'INVALID_AMOUNT', mensaje: 'El monto de transferencia debe ser mayor a cero.' };
  }

  const connection = await pool.getConnection();
  try {
    // 1. Iniciar Transacción explícita en MySQL
    await connection.beginTransaction();

    // 2. Consultar preliminarmente la cuenta destino SIN bloquear para obtener su ID numérico
    const [preCuentasDestino] = await connection.execute(
      'SELECT id_cuenta, id_moneda, estado, saldo FROM CUENTAS WHERE numero_cuenta = ?',
      [numeroCuentaDestino]
    );

    if (preCuentasDestino.length === 0) {
      await connection.rollback();
      return { exitoso: false, status: 404, error_code: 'DESTINATION_ACCOUNT_NOT_FOUND', mensaje: 'La cuenta destino no existe.' };
    }

    const preCuentaDestino = preCuentasDestino[0];
    const idCuentaDestino = preCuentaDestino.id_cuenta;

    if (idCuentaOrigen === idCuentaDestino) {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'SAME_ACCOUNT', mensaje: 'No se puede transferir dinero a la misma cuenta de origen.' };
    }

    // 3. Ordenar IDs de cuenta para evitar Deadlocks (Abrazo mortal) en accesos concurrentes cruzados
    const [idMenor, idMayor] = [idCuentaOrigen, idCuentaDestino].sort((a, b) => a - b);

    // 4. Bloquear las filas secuencialmente por clave primaria de forma ascendente
    const [cuentasLock1] = await connection.execute(
      'SELECT * FROM CUENTAS WHERE id_cuenta = ? FOR UPDATE',
      [idMenor]
    );
    const [cuentasLock2] = await connection.execute(
      'SELECT * FROM CUENTAS WHERE id_cuenta = ? FOR UPDATE',
      [idMayor]
    );

    if (cuentasLock1.length === 0 || cuentasLock2.length === 0) {
      await connection.rollback();
      return { exitoso: false, status: 404, error_code: 'ACCOUNT_NOT_FOUND', mensaje: 'Una de las cuentas involucradas no fue encontrada.' };
    }

    // Mapear los resultados bloqueados de vuelta a Origen y Destino
    const cuentaOrigen = cuentasLock1[0].id_cuenta === idCuentaOrigen ? cuentasLock1[0] : cuentasLock2[0];
    const cuentaDestino = cuentasLock1[0].id_cuenta === idCuentaDestino ? cuentasLock1[0] : cuentasLock2[0];

    // 5. Validaciones de Negocio bajo exclusión mutua (Bloqueo activo)
    if (cuentaOrigen.id_usuario !== idUsuarioPropietario) {
      await connection.rollback();
      return { exitoso: false, status: 403, error_code: 'FORBIDDEN_OWNERSHIP', mensaje: 'No estás autorizado para transferir desde esta cuenta.' };
    }

    if (cuentaOrigen.estado !== 'ACTIVA') {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'ACCOUNT_NOT_ACTIVE', mensaje: 'La cuenta origen no se encuentra activa.' };
    }

    if (cuentaDestino.estado !== 'ACTIVA') {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'ACCOUNT_NOT_ACTIVE', mensaje: 'La cuenta destino no se encuentra activa.' };
    }

    // Regla estricta: Las transferencias a terceros requieren coincidencia de monedas
    if (cuentaOrigen.id_moneda !== cuentaDestino.id_moneda) {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'CURRENCY_MISMATCH', mensaje: 'La cuenta destino maneja una moneda diferente. Realice una conversión.' };
    }

    const saldoOrigen = parseFloat(cuentaOrigen.saldo);
    if (saldoOrigen < montoDebitar) {
      await connection.rollback();
      return { exitoso: false, status: 422, error_code: 'INSUFFICIENT_FUNDS', mensaje: 'Saldo insuficiente en la cuenta de origen.' };
    }

    // 6. Restar fondos en origen y sumar en destino
    const nuevoSaldoOrigen = saldoOrigen - montoDebitar;
    const nuevoSaldoDestino = parseFloat(cuentaDestino.saldo) + montoDebitar;

    await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoOrigen, idCuentaOrigen]);
    await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoDestino, idCuentaDestino]);

    // 7. Generar número de referencia de transferencia (máximo 20 caracteres)
    const numeroReferencia = `TX-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;

    // 8. Insertar registro inmutable de transacción
    const queryTx = `
      INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
      VALUES (?, ?, ?, ?, NULL, 'TRANSFERENCIA', ?, ?, 'COMPLETADA', NOW())
    `;
    const [resTx] = await connection.execute(queryTx, [
      idCuentaOrigen,
      idCuentaDestino,
      montoDebitar,
      montoDebitar,
      descripcion || 'Transferencia inmediata',
      numeroReferencia
    ]);

    await connection.commit();

    return {
      exitoso: true,
      transaccion: {
        id_transaccion: resTx.insertId,
        numero_referencia: numeroReferencia,
        monto: montoDebitar,
        fecha: new Date()
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('Error en transacción de transferencia (ROLLBACK):', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Ejecuta conversión de divisas entre cuentas del mismo propietario (ACID).
 * Prevención de Deadlocks mediante ordenamiento de IDs de cuenta y bloqueo secuencial ascendente.
 */
async function ejecutarConversion(idCuentaOrigen, idCuentaDestino, montoOrigen, idUsuarioPropietario) {
  const montoDebitar = parseFloat(montoOrigen);

  // Validación defensiva en capa de servicio
  if (isNaN(montoDebitar) || montoDebitar <= 0) {
    return { exitoso: false, status: 400, error_code: 'INVALID_AMOUNT', mensaje: 'El monto a convertir debe ser mayor a cero.' };
  }

  if (idCuentaOrigen === idCuentaDestino) {
    return { exitoso: false, status: 400, error_code: 'SAME_ACCOUNT', mensaje: 'La cuenta origen y destino deben ser distintas.' };
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Ordenar IDs de cuenta para prevenir Deadlocks en la adquisición de bloqueos de fila
    const [idMenor, idMayor] = [idCuentaOrigen, idCuentaDestino].sort((a, b) => a - b);

    // 2. Bloquear secuencialmente por clave primaria de forma ascendente
    const [cuentasLock1] = await connection.execute(
      'SELECT c.*, m.codigo_iso FROM CUENTAS c JOIN MONEDAS m ON c.id_moneda = m.id_moneda WHERE c.id_cuenta = ? FOR UPDATE',
      [idMenor]
    );
    const [cuentasLock2] = await connection.execute(
      'SELECT c.*, m.codigo_iso FROM CUENTAS c JOIN MONEDAS m ON c.id_moneda = m.id_moneda WHERE c.id_cuenta = ? FOR UPDATE',
      [idMayor]
    );

    if (cuentasLock1.length === 0 || cuentasLock2.length === 0) {
      await connection.rollback();
      return { exitoso: false, status: 404, error_code: 'ACCOUNT_NOT_FOUND', mensaje: 'Una de las cuentas indicadas no fue encontrada.' };
    }

    // Mapear los resultados bloqueados de vuelta a Origen y Destino
    const cuentaOrigen = cuentasLock1[0].id_cuenta === idCuentaOrigen ? cuentasLock1[0] : cuentasLock2[0];
    const cuentaDestino = cuentasLock1[0].id_cuenta === idCuentaDestino ? cuentasLock1[0] : cuentasLock2[0];

    // 3. Validaciones de Negocio bajo exclusión mutua
    if (cuentaOrigen.id_usuario !== idUsuarioPropietario) {
      await connection.rollback();
      return { exitoso: false, status: 403, error_code: 'FORBIDDEN_OWNERSHIP', mensaje: 'No eres propietario de la cuenta origen.' };
    }

    if (cuentaDestino.id_usuario !== idUsuarioPropietario) {
      await connection.rollback();
      return { exitoso: false, status: 403, error_code: 'FORBIDDEN_OWNERSHIP', mensaje: 'No eres propietario de la cuenta destino.' };
    }

    const saldoOrigen = parseFloat(cuentaOrigen.saldo);
    if (saldoOrigen < montoDebitar) {
      await connection.rollback();
      return { exitoso: false, status: 422, error_code: 'INSUFFICIENT_FUNDS', mensaje: 'Saldo insuficiente para realizar la conversión.' };
    }

    // 4. Consultar tasa de cambio activa
    const [tasas] = await connection.execute(
      'SELECT * FROM TASAS_CAMBIO WHERE id_moneda_origen = ? AND id_moneda_destino = ? AND activo = TRUE',
      [cuentaOrigen.id_moneda, cuentaDestino.id_moneda]
    );

    let tasaAplicadaObj = null;
    let tasaDeCambio = 1.0;
    let esVenta = false;

    if (tasas.length > 0) {
      tasaAplicadaObj = tasas[0];
      esVenta = cuentaOrigen.codigo_iso === 'GTQ';
      tasaDeCambio = esVenta ? parseFloat(tasaAplicadaObj.tasa_venta) : parseFloat(tasaAplicadaObj.tasa_compra);
    } else {
      // Intentar par inverso
      const [tasasInversas] = await connection.execute(
        'SELECT * FROM TASAS_CAMBIO WHERE id_moneda_origen = ? AND id_moneda_destino = ? AND activo = TRUE',
        [cuentaDestino.id_moneda, cuentaOrigen.id_moneda]
      );

      if (tasasInversas.length > 0) {
        tasaAplicadaObj = tasasInversas[0];
        esVenta = cuentaOrigen.codigo_iso === 'GTQ';
        const tasaBase = esVenta ? parseFloat(tasaAplicadaObj.tasa_venta) : parseFloat(tasaAplicadaObj.tasa_compra);
        tasaDeCambio = 1.0 / tasaBase;
      } else {
        await connection.rollback();
        return { exitoso: false, status: 400, error_code: 'EXCHANGE_RATE_NOT_FOUND', mensaje: 'No se definió tasa de cambio para este par de monedas.' };
      }
    }

    // 5. Calcular el monto destino
    let montoAbonar = esVenta ? (montoDebitar / tasaDeCambio) : (montoDebitar * tasaDeCambio);
    montoAbonar = Math.round(montoAbonar * 100) / 100; // Redondear a 2 decimales financieros

    // 6. Actualizar saldos
    const nuevoSaldoOrigen = saldoOrigen - montoDebitar;
    const nuevoSaldoDestino = parseFloat(cuentaDestino.saldo) + montoAbonar;

    await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoOrigen, idCuentaOrigen]);
    await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoDestino, idCuentaDestino]);

    // 7. Generar número de referencia de conversión
    const numeroReferencia = `CVN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 8. Insertar registro de transacción
    const queryTx = `
      INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
      VALUES (?, ?, ?, ?, ?, 'CONVERSION', ?, ?, 'COMPLETADA', NOW())
    `;
    const [resTx] = await connection.execute(queryTx, [
      idCuentaOrigen,
      idCuentaDestino,
      montoDebitar,
      montoAbonar,
      tasaAplicadaObj ? tasaAplicadaObj.id_tasa : null,
      `Conversión propia de ${cuentaOrigen.codigo_iso} a ${cuentaDestino.codigo_iso}`,
      numeroReferencia
    ]);

    await connection.commit();

    return {
      exitoso: true,
      transaccion: {
        id_transaccion: resTx.insertId,
        numero_referencia: numeroReferencia,
        monto_origen: montoDebitar,
        monto_destino: montoAbonar,
        tasa: tasaDeCambio,
        fecha: new Date()
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('Error en conversión de divisas (ROLLBACK):', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtener historial paginado para una cuenta.
 */
async function obtenerHistorial(idCuenta, idUsuario, rolUsuario, filtros = {}) {
  const page = parseInt(filtros.page) || 1;
  const limit = parseInt(filtros.limit) || 20;
  const offset = (page - 1) * limit;

  // Validar propiedad de la cuenta
  const [cuentas] = await pool.execute('SELECT id_usuario FROM CUENTAS WHERE id_cuenta = ?', [idCuenta]);
  if (cuentas.length === 0) {
    return { exitoso: false, status: 404, mensaje: 'Cuenta no encontrada.' };
  }

  if (rolUsuario === 'CLIENTE' && cuentas[0].id_usuario !== idUsuario) {
    return { exitoso: false, status: 403, mensaje: 'Acceso no autorizado al historial de esta cuenta.' };
  }

  // Consulta paginada
  const query = `
    SELECT t.*, 
           co.numero_cuenta AS cuenta_origen, 
           cd.numero_cuenta AS cuenta_destino
    FROM TRANSACCIONES t
    LEFT JOIN CUENTAS co ON t.id_cuenta_origen = co.id_cuenta
    JOIN CUENTAS cd ON t.id_cuenta_destino = cd.id_cuenta
    WHERE t.id_cuenta_origen = ? OR t.id_cuenta_destino = ?
    ORDER BY t.fecha DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(query, [idCuenta, idCuenta, limit, offset]);

  // Consulta de total de registros para paginación
  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM TRANSACCIONES WHERE id_cuenta_origen = ? OR id_cuenta_destino = ?',
    [idCuenta, idCuenta]
  );
  const total = countRows[0].total;

  return {
    exitoso: true,
    transacciones: rows,
    paginacion: {
      total,
      paginas: Math.ceil(total / limit),
      pagina_actual: page,
      limite: limit
    }
  };
}

module.exports = {
  ejecutarTransferencia,
  ejecutarConversion,
  obtenerHistorial
};
