// prestamo.service.js - Lógica de Negocio para Préstamos Financieros (Backend)

const { pool } = require('../config/db.config');
const prestamoModel = require('../models/prestamo.model');

/**
 * Solicitar un nuevo préstamo.
 * Aplica aprobación automática para montos <= 3000 basados en reglas de ingresos y estabilidad.
 * Si es > 3000 queda en PENDIENTE_VALIDACION para revisión del gerente.
 */
async function solicitarPrestamo(payload, idUsuario) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      id_cuenta_desembolso,
      monto_solicitado,
      ingresos_declarados,
      estabilidad, // Estabilidad laboral (ej. en años o meses)
      telefono,
      descripcion
    } = payload;

    // 1. Validar cuenta de desembolso
    const [cuentas] = await connection.execute(
      'SELECT * FROM CUENTAS WHERE id_cuenta = ? AND id_usuario = ? FOR UPDATE',
      [id_cuenta_desembolso, idUsuario]
    );

    if (cuentas.length === 0) {
      await connection.rollback();
      return { exitoso: false, status: 404, error_code: 'ACCOUNT_NOT_FOUND', mensaje: 'Cuenta de desembolso no válida o no pertenece al usuario.' };
    }

    const cuenta = cuentas[0];
    if (cuenta.estado !== 'ACTIVA') {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'ACCOUNT_NOT_ACTIVE', mensaje: 'La cuenta de desembolso seleccionada no está activa.' };
    }

    const monto = parseFloat(monto_solicitado);
    const ingresos = parseFloat(ingresos_declarados);
    const est = parseFloat(estabilidad);

    if (isNaN(monto) || monto <= 0 || isNaN(ingresos) || ingresos <= 0) {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'INVALID_FIELDS', mensaje: 'Monto o ingresos declarados inválidos.' };
    }

    let estado = 'PENDIENTE';
    let cuota_mensual = monto / 12; // Plazo por defecto 12 meses
    let saldo_pendiente = monto;

    // Regla de Negocio
    if (monto > 3000) {
      // Requiere validación del gerente
      estado = 'PENDIENTE_VALIDACION';
      console.log(`[NOTIFICACIÓN AL GERENTE]: Solicitud de préstamo de Q${monto} para usuario ${idUsuario} requiere validación manual.`);
    } else {
      // Reglas de negocio automáticas para montos menores
      // La cuota mensual no debe exceder el 30% de los ingresos declarados
      const cuotaEst = monto / 12;
      const cumpleIngresos = cuotaEst <= ingresos * 0.3;
      // Estabilidad laboral debe ser de al menos 1 año (12 meses o valor >= 1)
      const cumpleEstabilidad = est >= 1; // Asumiendo años por defecto, o >= 12 si es meses. Aceptamos >= 1 para flex.

      if (cumpleIngresos && cumpleEstabilidad) {
        estado = 'APROBADO';
      } else {
        estado = 'RECHAZADO';
      }
    }

    // Calcular fecha límite del primer pago si se aprueba
    const fechaLimite = estado === 'APROBADO' ? new Date() : null;
    if (fechaLimite) {
      fechaLimite.setDate(fechaLimite.getDate() + 30);
    }

    // 2. Registrar el préstamo en la base de datos
    const queryPrestamo = `
      INSERT INTO PRESTAMOS (
        id_usuario_solicitante, 
        id_cuenta_desembolso, 
        monto_solicitado, 
        ingresos_declarados, 
        estado, 
        saldo_pendiente, 
        cuota_mensual, 
        fecha_limite_pago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resPrestamo] = await connection.execute(queryPrestamo, [
      idUsuario,
      id_cuenta_desembolso,
      monto,
      ingresos,
      estado,
      estado === 'APROBADO' ? saldo_pendiente : 0.00,
      estado === 'APROBADO' ? cuota_mensual : 0.00,
      fechaLimite
    ]);

    const idPrestamo = resPrestamo.insertId;

    if (estado === 'PENDIENTE_VALIDACION') {
      try {
        const notificacionService = require('./notificacion.service');
        await notificacionService.crearNotificacion(
          'Nuevo Préstamo Pendiente',
          `Se ha registrado una solicitud de préstamo por Q${monto.toFixed(2)} del cliente ID ${idUsuario}. Requiere asignación a un revisor.`,
          'ADMIN',
          null,
          'PRESTAMO_PENDIENTE',
          idPrestamo
        );
      } catch (err) {
        console.error('Error al generar notificación para admin:', err);
      }
    }

    // 3. Si se aprobó de forma automática, realizar el desembolso acreditando los fondos
    if (estado === 'APROBADO') {
      const nuevoSaldo = parseFloat(cuenta.saldo) + monto;
      await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldo, id_cuenta_desembolso]);

      // Registrar transacción inmutable de desembolso (máximo 20 caracteres)
      const numeroReferencia = `DS-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;
      const queryTx = `
        INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
        VALUES (NULL, ?, ?, ?, NULL, 'DESEMBOLSO', ?, ?, 'COMPLETADA', NOW())
      `;
      await connection.execute(queryTx, [
        id_cuenta_desembolso,
        monto,
        monto,
        descripcion || `Desembolso préstamo automático aprobado Q${monto}`,
        numeroReferencia
      ]);
    }

    await connection.commit();

    return {
      exitoso: true,
      data: {
        id_prestamo: idPrestamo,
        estado: estado,
        monto_solicitado: monto,
        mensaje: estado === 'APROBADO' 
          ? '¡Tu préstamo ha sido aprobado automáticamente y los fondos se han acreditado!'
          : (estado === 'PENDIENTE_VALIDACION' 
              ? 'Tu solicitud supera Q3,000 y requiere validación del gerente.' 
              : 'Tu solicitud no cumple con los criterios de ingresos y estabilidad y ha sido rechazada.')
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar solicitud de préstamo (ROLLBACK):', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Pagar la cuota de un préstamo activo.
 * Cobra intereses adicionales del 5% si la fecha actual sobrepasa la límite de pago.
 */
async function pagarCuotaPrestamo(idPrestamo, idCuentaOrigen, idUsuario) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Obtener detalles del préstamo bloqueado
    const [prestamos] = await connection.execute(
      'SELECT * FROM PRESTAMOS WHERE id_prestamo = ? AND id_usuario_solicitante = ? FOR UPDATE',
      [idPrestamo, idUsuario]
    );

    if (prestamos.length === 0) {
      await connection.rollback();
      return { exitoso: false, status: 404, error_code: 'LOAN_NOT_FOUND', mensaje: 'Préstamo no encontrado.' };
    }

    const prestamo = prestamos[0];
    
    if (prestamo.estado !== 'APROBADO') {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'LOAN_INACTIVE', mensaje: 'El préstamo no está en estado APROBADO o ya está cancelado.' };
    }

    const saldoPendiente = parseFloat(prestamo.saldo_pendiente);
    if (saldoPendiente <= 0) {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'LOAN_ALREADY_PAID', mensaje: 'El préstamo ya ha sido cancelado en su totalidad.' };
    }

    // 2. Obtener detalles de la cuenta de origen bloqueada
    const [cuentas] = await connection.execute(
      'SELECT * FROM CUENTAS WHERE id_cuenta = ? AND id_usuario = ? FOR UPDATE',
      [idCuentaOrigen, idUsuario]
    );

    if (cuentas.length === 0) {
      await connection.rollback();
      return { exitoso: false, status: 404, error_code: 'ACCOUNT_NOT_FOUND', mensaje: 'Cuenta de origen no encontrada.' };
    }

    const cuenta = cuentas[0];
    if (cuenta.estado !== 'ACTIVA') {
      await connection.rollback();
      return { exitoso: false, status: 400, error_code: 'ACCOUNT_NOT_ACTIVE', mensaje: 'La cuenta origen seleccionada no está activa.' };
    }

    // 3. Determinar cuota e intereses por retraso
    const cuota = parseFloat(prestamo.cuota_mensual);
    let recargoInteres = 0;
    const hoy = new Date();
    const limitePago = prestamo.fecha_limite_pago ? new Date(prestamo.fecha_limite_pago) : null;

    if (limitePago && hoy > limitePago) {
      // Recargo del 5% sobre la cuota por retraso
      recargoInteres = cuota * 0.05;
      console.log(`[RECARGO DE INTERÉS]: Préstamo retrasado (Límite: ${limitePago.toISOString()}). Se aplica recargo de Q${recargoInteres}.`);
    }

    const totalAPagar = cuota + recargoInteres;
    const saldoCuenta = parseFloat(cuenta.saldo);

    if (saldoCuenta < totalAPagar) {
      await connection.rollback();
      return { 
        exitoso: false, 
        status: 422, 
        error_code: 'INSUFFICIENT_FUNDS', 
        mensaje: `Fondos insuficientes. Se requiere Q${totalAPagar.toFixed(2)} (Cuota: Q${cuota.toFixed(2)} + Recargo: Q${recargoInteres.toFixed(2)}), tu saldo es Q${saldoCuenta.toFixed(2)}.`
      };
    }

    // 4. Procesar débito en la cuenta
    const nuevoSaldoCuenta = saldoCuenta - totalAPagar;
    await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldoCuenta, idCuentaOrigen]);

    // 5. Actualizar el saldo del préstamo
    // Si la cuota cubre o excede el saldo restante del préstamo, se liquida
    const montoReduccion = Math.min(saldoPendiente, cuota);
    const nuevoSaldoPrestamo = Math.max(0, saldoPendiente - montoReduccion);

    // Calcular la nueva fecha límite de pago para el próximo mes
    let nuevaFechaLimite = null;
    if (nuevoSaldoPrestamo > 0 && limitePago) {
      nuevaFechaLimite = new Date(limitePago);
      nuevaFechaLimite.setMonth(nuevaFechaLimite.getMonth() + 1);
    }

    await connection.execute(
      'UPDATE PRESTAMOS SET saldo_pendiente = ?, fecha_limite_pago = ? WHERE id_prestamo = ?',
      [nuevoSaldoPrestamo, nuevaFechaLimite, idPrestamo]
    );

    // 6. Registrar la transacción de cobro (máximo 20 caracteres)
    const numeroReferencia = `PY-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;
    const queryTx = `
      INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
      VALUES (?, ?, ?, ?, NULL, 'TRANSFERENCIA', ?, ?, 'COMPLETADA', NOW())
    `;
    await connection.execute(queryTx, [
      idCuentaOrigen,
      prestamo.id_cuenta_desembolso, // Se transfiere al destino del desembolso (el banco)
      totalAPagar,
      totalAPagar,
      `Pago cuota de préstamo No. ${idPrestamo}. Cuota: Q${cuota.toFixed(2)}, Intereses: Q${recargoInteres.toFixed(2)}`,
      numeroReferencia
    ]);

    await connection.commit();

    return {
      exitoso: true,
      data: {
        id_prestamo: idPrestamo,
        monto_pagado: totalAPagar,
        cuota_amortizada: montoReduccion,
        interes_retraso: recargoInteres,
        saldo_pendiente: nuevoSaldoPrestamo,
        fecha_proxima_limite: nuevaFechaLimite
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar pago de préstamo (ROLLBACK):', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  solicitarPrestamo,
  pagarCuotaPrestamo
};
