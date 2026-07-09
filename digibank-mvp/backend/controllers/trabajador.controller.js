const { pool } = require('../config/db.config');
const AuditLog = require('../models/auditLog.model');

// 1. Buscar cuenta por número de cuenta (con o sin guiones)
async function buscarCuentaPorNumero(req, res) {
  try {
    const { numeroCuenta } = req.params;
    const numeroLimpio = numeroCuenta.replace(/-/g, '').trim();

    const query = `
      SELECT c.id_cuenta, c.numero_cuenta, c.tipo_cuenta, c.saldo, c.estado, 
             u.id_usuario, u.nombres, u.apellidos, u.email, m.codigo_iso, m.simbolo
      FROM CUENTAS c
      JOIN USUARIOS u ON c.id_usuario = u.id_usuario
      JOIN MONEDAS m ON c.id_moneda = m.id_moneda
      WHERE c.numero_cuenta = ?
    `;
    const [rows] = await pool.execute(query, [numeroLimpio]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_FOUND', message: 'La cuenta bancaria no existe.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al buscar cuenta:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al buscar la cuenta bancaria.' }
    });
  }
}

// 2. Procesar operación de caja (depósito o retiro en efectivo)
async function procesarOperacionCaja(req, res) {
  const connection = await pool.getConnection();
  try {
    const { id_cuenta, tipo, monto, descripcion } = req.body;
    const montoNum = parseFloat(monto);

    if (!id_cuenta || !tipo || isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Datos incompletos o monto inválido.' }
      });
    }

    if (tipo !== 'DEPOSITO' && tipo !== 'RETIRO') {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Tipo de operación de caja no válido.' }
      });
    }

    await connection.beginTransaction();

    // Bloquear la cuenta para actualización
    const [cuentas] = await connection.execute(
      'SELECT c.*, m.codigo_iso, m.simbolo FROM CUENTAS c JOIN MONEDAS m ON c.id_moneda = m.id_moneda WHERE c.id_cuenta = ? FOR UPDATE',
      [id_cuenta]
    );

    if (cuentas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_FOUND', message: 'La cuenta no existe.' }
      });
    }

    const cuenta = cuentas[0];
    if (cuenta.estado !== 'ACTIVA') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_ACTIVE', message: 'La cuenta seleccionada no está activa.' }
      });
    }

    const saldoActual = parseFloat(cuenta.saldo);
    let nuevoSaldo = saldoActual;

    if (tipo === 'DEPOSITO') {
      nuevoSaldo = saldoActual + montoNum;
    } else {
      if (saldoActual < montoNum) {
        await connection.rollback();
        return res.status(422).json({
          success: false,
          error: { code: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente en la cuenta para realizar el retiro.' }
        });
      }
      nuevoSaldo = saldoActual - montoNum;
    }

    // Actualizar saldo
    await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldo, id_cuenta]);

    // Generar referencia
    const prefix = tipo === 'DEPOSITO' ? 'DP' : 'RT';
    const reference = `${prefix}-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;

    // Insertar registro de transacción
    const queryTx = `
      INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
      VALUES (?, ?, ?, ?, NULL, 'TRANSFERENCIA', ?, ?, 'COMPLETADA', NOW())
    `;
    const idOrigen = tipo === 'DEPOSITO' ? null : id_cuenta;
    const idDestino = id_cuenta;

    await connection.execute(queryTx, [
      idOrigen,
      idDestino,
      montoNum,
      montoNum,
      descripcion || `${tipo === 'DEPOSITO' ? 'Depósito' : 'Retiro'} en ventanilla`,
      reference
    ]);

    await connection.commit();

    // Guardar Auditoría NoSQL en MongoDB
    try {
      const newLog = new AuditLog({
        id_usuario: req.user.id_usuario,
        rol: req.user.rol,
        accion: tipo === 'DEPOSITO' ? 'DEPOSITO_CAJA' : 'RETIRO_CAJA',
        ip_address: req.ip || '127.0.0.1',
        user_agent: req.headers['user-agent'] || '',
        detalles: {
          cuenta_afectada: cuenta.numero_cuenta,
          monto: montoNum,
          moneda: cuenta.codigo_iso,
          numero_referencia: reference,
          descripcion: descripcion || 'Operación de ventanilla'
        }
      });
      await newLog.save();
    } catch (mongoErr) {
      console.error('Error al guardar log de auditoría en MongoDB:', mongoErr);
    }

    return res.status(200).json({
      success: true,
      data: {
        numero_referencia: reference,
        nuevo_saldo: nuevoSaldo,
        monto: montoNum,
        tipo
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error en operación de caja:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al procesar la operación de caja.' }
    });
  } finally {
    connection.release();
  }
}

// 3. Consultar historial de operaciones de caja en MongoDB
async function listarOperacionesCaja(req, res) {
  try {
    const logs = await AuditLog.find({
      id_usuario: req.user.id_usuario,
      accion: { $in: ['DEPOSITO_CAJA', 'RETIRO_CAJA'] }
    }).sort({ timestamp: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error al listar operaciones:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al listar el historial de operaciones de caja.' }
    });
  }
}

// 4. Listar préstamos asignados al empleado logueado
async function listarPrestamosAsignados(req, res) {
  try {
    const idEmpleado = req.user.id_usuario;
    const query = `
      SELECT p.*, u.nombres, u.apellidos, u.email, c.numero_cuenta, m.simbolo
      FROM PRESTAMOS p
      JOIN USUARIOS u ON p.id_usuario_solicitante = u.id_usuario
      JOIN CUENTAS c ON p.id_cuenta_desembolso = c.id_cuenta
      JOIN MONEDAS m ON c.id_moneda = m.id_moneda
      WHERE p.id_usuario_revisor = ? AND p.estado = 'ASIGNADO_A_EMPLEADO'
      ORDER BY p.fecha_solicitud DESC
    `;
    const [rows] = await pool.execute(query, [idEmpleado]);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al listar préstamos asignados:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al listar los préstamos asignados.' }
    });
  }
}

// 5. Aprobar o rechazar préstamo asignado
async function actualizarEstadoPrestamo(req, res) {
  const connection = await pool.getConnection();
  try {
    const idPrestamo = req.params.idPrestamo;
    const idEmpleado = req.user.id_usuario;
    const { estado, comentario_revisor } = req.body;

    if (!estado || (estado !== 'APROBADO' && estado !== 'RECHAZADO')) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Estado inválido. Debe ser APROBADO o RECHAZADO.' }
      });
    }

    await connection.beginTransaction();

    const [prestamos] = await connection.execute(
      'SELECT * FROM PRESTAMOS WHERE id_prestamo = ? AND id_usuario_revisor = ? FOR UPDATE',
      [idPrestamo, idEmpleado]
    );

    if (prestamos.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: { code: 'LOAN_NOT_FOUND', message: 'Préstamo no encontrado o no asignado a este empleado.' }
      });
    }

    const prestamo = prestamos[0];
    if (prestamo.estado !== 'ASIGNADO_A_EMPLEADO') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'LOAN_ALREADY_RESOLVED', message: 'El préstamo ya ha sido resuelto.' }
      });
    }

    if (estado === 'APROBADO') {
      const monto = parseFloat(prestamo.monto_solicitado);
      
      const [cuentas] = await connection.execute(
        'SELECT * FROM CUENTAS WHERE id_cuenta = ? FOR UPDATE',
        [prestamo.id_cuenta_desembolso]
      );
      if (cuentas.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: { code: 'ACCOUNT_NOT_FOUND', message: 'La cuenta de desembolso no existe.' }
        });
      }
      const cuenta = cuentas[0];
      const nuevoSaldo = parseFloat(cuenta.saldo) + monto;

      await connection.execute('UPDATE CUENTAS SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldo, prestamo.id_cuenta_desembolso]);

      const reference = `DS-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;

      const queryTx = `
        INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha)
        VALUES (NULL, ?, ?, ?, NULL, 'DESEMBOLSO', ?, ?, 'COMPLETADA', NOW())
      `;
      await connection.execute(queryTx, [
        prestamo.id_cuenta_desembolso,
        monto,
        monto,
        `Desembolso préstamo No. ${idPrestamo} aprobado por empleado`,
        reference
      ]);

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 30);
      const cuota = monto / 12;

      await connection.execute(
        'UPDATE PRESTAMOS SET estado = ?, comentario_revisor = ?, fecha_resolucion = NOW(), saldo_pendiente = ?, cuota_mensual = ?, fecha_limite_pago = ? WHERE id_prestamo = ?',
        [estado, comentario_revisor || 'Aprobado en ventanilla', monto, cuota, fechaLimite, idPrestamo]
      );
    } else {
      await connection.execute(
        'UPDATE PRESTAMOS SET estado = ?, comentario_revisor = ?, fecha_resolucion = NOW() WHERE id_prestamo = ?',
        [estado, comentario_revisor || 'Rechazado en ventanilla', idPrestamo]
      );
    }

    // Crear notificación para Administradores informando sobre la resolución
    try {
      const notificacionService = require('../services/notificacion.service');
      await notificacionService.crearNotificacion(
        'Préstamo Resuelto',
        `El revisor ID ${idEmpleado} ha ${estado.toLowerCase()} el préstamo No. ${idPrestamo}.`,
        'ADMIN',
        null,
        'PRESTAMO_RESOLVIDO',
        parseInt(idPrestamo)
      );
      
      // Notificar al propio cliente que solicitó el préstamo
      await notificacionService.crearNotificacion(
        'Resolución de Préstamo',
        `Tu solicitud de préstamo No. ${idPrestamo} ha sido ${estado.toLowerCase()}.\nComentarios: ${comentario_revisor || 'Sin comentarios adicionales.'}`,
        'CLIENTE',
        prestamo.id_usuario_solicitante,
        'PRESTAMO_RESOLVIDO',
        parseInt(idPrestamo)
      );
    } catch (err) {
      console.error('Error al generar notificaciones de resolución:', err);
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      mensaje: `El préstamo ha sido ${estado.toLowerCase()} exitosamente.`
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al resolver préstamo:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al resolver la solicitud de préstamo.' }
    });
  } finally {
    connection.release();
  }
}

// 6. Crear un cliente nuevo y abrirle su cuenta de bienvenida
async function crearClienteYCuenta(req, res) {
  const bcrypt = require('bcryptjs');
  const connection = await pool.getConnection();
  try {
    const { nombres, apellidos, email, dpi, password, moneda, monto_apertura } = req.body;
    const montoNum = parseFloat(monto_apertura);

    if (!nombres || !apellidos || !email || !dpi || !password || !moneda || isNaN(montoNum) || montoNum < 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Nombres, apellidos, email, DPI, contraseña genérica, moneda y monto de apertura son requeridos.' }
      });
    }

    await connection.beginTransaction();

    const [existing] = await connection.execute('SELECT id_usuario FROM USUARIOS WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Ya existe un usuario registrado con este correo electrónico.' }
      });
    }

    const [existingDpi] = await connection.execute('SELECT id_usuario FROM USUARIOS WHERE dpi = ?', [dpi]);
    if (existingDpi.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'DPI_EXISTS', message: 'Ya existe un usuario registrado con este número de DPI.' }
      });
    }

    // Cifrar la contraseña genérica
    const passwordHash = await bcrypt.hash(password, 10);
    const mockUid = `mock-uid-${email.split('@')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;

    const queryUser = `
      INSERT INTO USUARIOS (id_rol, firebase_uid, nombres, apellidos, email, password_hash, debe_cambiar_password, estado, dpi)
      VALUES (4, ?, ?, ?, ?, ?, TRUE, 'ACTIVO', ?)
    `;
    const [resUser] = await connection.execute(queryUser, [mockUid, nombres, apellidos, email, passwordHash, dpi]);
    const idUsuario = resUser.insertId;

    // Generar número de cuenta correlativo secuencial
    // Prefijo GTQ = '01', USD = '02'
    const prefix = moneda === 'USD' ? '02' : '01';
    
    const [lastAccounts] = await connection.execute(
      'SELECT numero_cuenta FROM CUENTAS WHERE numero_cuenta LIKE ? ORDER BY numero_cuenta DESC LIMIT 1',
      [`${prefix}%`]
    );

    let nextSeq = 1;
    if (lastAccounts.length > 0) {
      const lastNumStr = lastAccounts[0].numero_cuenta.substring(2);
      const lastNum = parseInt(lastNumStr, 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }

    const paddedSeq = String(nextSeq).padStart(8, '0');
    const numeroCuenta = `${prefix}${paddedSeq}`;

    const idMoneda = moneda === 'USD' ? 2 : 1;

    const queryCuenta = `
      INSERT INTO CUENTAS (id_usuario, id_moneda, numero_cuenta, tipo_cuenta, saldo, estado)
      VALUES (?, ?, ?, 'MONETARIA', ?, 'ACTIVA')
    `;
    await connection.execute(queryCuenta, [idUsuario, idMoneda, numeroCuenta, montoNum]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        id_usuario: idUsuario,
        nombres,
        apellidos,
        email,
        dpi,
        cuenta: {
          numero_cuenta: numeroCuenta,
          tipo_cuenta: 'MONETARIA',
          saldo: montoNum,
          moneda: moneda
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear asociado:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al registrar el asociado y crear su cuenta.' }
    });
  } finally {
    connection.release();
  }
}

// 7. Activar o desactivar cuenta bancaria
async function actualizarEstadoCuenta(req, res) {
  try {
    const idCuenta = req.params.idCuenta;
    const { estado } = req.body;

    if (!estado || (estado !== 'ACTIVA' && estado !== 'BLOQUEADA' && estado !== 'CERRADA')) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Estado inválido. Debe ser ACTIVA, BLOQUEADA o CERRADA.' }
      });
    }

    const [resUpdate] = await pool.execute(
      'UPDATE CUENTAS SET estado = ? WHERE id_cuenta = ?',
      [estado, idCuenta]
    );

    if (resUpdate.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_FOUND', message: 'Cuenta no encontrada.' }
      });
    }

    return res.status(200).json({
      success: true,
      mensaje: `La cuenta bancaria ha sido cambiada a estado ${estado} con éxito.`
    });
  } catch (error) {
    console.error('Error al actualizar estado de cuenta:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al actualizar el estado de la cuenta.' }
    });
  }
}

module.exports = {
  buscarCuentaPorNumero,
  procesarOperacionCaja,
  listarOperacionesCaja,
  listarPrestamosAsignados,
  actualizarEstadoPrestamo,
  crearClienteYCuenta,
  actualizarEstadoCuenta
};
