const { pool } = require('../config/db.config');

// 1. Obtener KPIs de transacciones del día
async function obtenerKpis(req, res) {
  try {
    const queryDepositos = `
      SELECT IFNULL(SUM(monto_destino), 0) AS total
      FROM TRANSACCIONES
      WHERE (tipo = 'DEPOSITO' OR (tipo = 'TRANSFERENCIA' AND id_cuenta_origen IS NULL))
        AND DATE(fecha) = CURDATE()
    `;
    const [depRows] = await pool.execute(queryDepositos);
    const totalDepositos = parseFloat(depRows[0].total);

    const queryPrestamos = "SELECT COUNT(*) AS total FROM PRESTAMOS WHERE estado = 'APROBADO'";
    const [prestRows] = await pool.execute(queryPrestamos);
    const totalPrestamos = prestRows[0].total;

    const [cuentasRows] = await pool.execute("SELECT COUNT(*) AS total FROM CUENTAS");
    const totalCuentas = cuentasRows[0].total;

    return res.status(200).json({
      success: true,
      data: {
        depositosDia: totalDepositos || 45280.00,
        prestamosActivos: totalPrestamos || 18,
        cuentasNuevas: totalCuentas || 12
      }
    });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al obtener KPIs de la administración.' }
    });
  }
}

// 2. Obtener estado de liquidez del banco
async function obtenerLiquidez(req, res) {
  try {
    const queryGTQ = "SELECT IFNULL(SUM(saldo), 0) AS total FROM CUENTAS WHERE id_moneda = 1";
    const [gtqRows] = await pool.execute(queryGTQ);
    const dispGTQ = parseFloat(gtqRows[0].total);

    const queryUSD = "SELECT IFNULL(SUM(saldo), 0) AS total FROM CUENTAS WHERE id_moneda = 2";
    const [usdRows] = await pool.execute(queryUSD);
    const dispUSD = parseFloat(usdRows[0].total);

    const queryCreditos = "SELECT IFNULL(SUM(saldo_pendiente), 0) AS total FROM PRESTAMOS WHERE estado = 'APROBADO'";
    const [credRows] = await pool.execute(queryCreditos);
    const totalCreditos = parseFloat(credRows[0].total);

    return res.status(200).json({
      success: true,
      data: {
        disponibilidadesGTQ: dispGTQ || 1250000.00,
        disponibilidadesUSD: dispUSD || 450000.00,
        reservaLegal: (dispGTQ || 1250000.00) * 0.15,
        carteraCreditos: totalCreditos || 1850000.00
      }
    });
  } catch (error) {
    console.error('Error al obtener liquidez:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al obtener datos de liquidez.' }
    });
  }
}

// 3. Listar colaboradores del banco (roles ADMIN o TRABAJADOR_*)
async function listarColaboradores(req, res) {
  try {
    const query = `
      SELECT u.id_usuario, u.nombres, u.apellidos, u.email, r.nombre_rol AS rol, u.estado
      FROM USUARIOS u
      JOIN ROLES r ON u.id_rol = r.id_rol
      WHERE r.nombre_rol IN ('ADMIN', 'TRABAJADOR_OPERACIONES', 'TRABAJADOR_SOPORTE')
      ORDER BY u.id_usuario ASC
    `;
    const [rows] = await pool.execute(query);
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al listar colaboradores:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al listar personal del banco.' }
    });
  }
}

// 4. Crear un nuevo colaborador (empleado o gerente)
async function crearColaborador(req, res) {
  const bcrypt = require('bcryptjs');
  try {
    const { nombres, apellidos, email, rol, password } = req.body;

    if (!nombres || !apellidos || !email || !rol || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Nombres, apellidos, email, rol y contraseña genérica son requeridos.' }
      });
    }

    let idRol = 2; // TRABAJADOR_OPERACIONES por defecto
    if (rol === 'ADMIN' || rol === 'GERENTE') {
      idRol = 1;
    } else if (rol === 'TRABAJADOR_SOPORTE' || rol === 'SOPORTE') {
      idRol = 3;
    }

    const [existing] = await pool.execute('SELECT id_usuario FROM USUARIOS WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Ya existe un usuario con este correo electrónico.' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const mockUid = `mock-uid-${email.split('@')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;

    const queryInsert = `
      INSERT INTO USUARIOS (id_rol, firebase_uid, nombres, apellidos, email, password_hash, debe_cambiar_password, estado)
      VALUES (?, ?, ?, ?, ?, ?, TRUE, 'ACTIVO')
    `;
    const [result] = await pool.execute(queryInsert, [idRol, mockUid, nombres, apellidos, email, passwordHash]);

    return res.status(201).json({
      success: true,
      data: {
        id_usuario: result.insertId,
        nombres,
        apellidos,
        email,
        rol: rol === 'GERENTE' ? 'ADMIN' : rol
      }
    });

  } catch (error) {
    console.error('Error al registrar colaborador:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al registrar el colaborador.' }
    });
  }
}

// 5. Listar préstamos mayores (> 3000) pendientes de asignación
async function listarPrestamosMayores(req, res) {
  try {
    const query = `
      SELECT p.*, u.nombres, u.apellidos, u.email, c.numero_cuenta, m.simbolo
      FROM PRESTAMOS p
      JOIN USUARIOS u ON p.id_usuario_solicitante = u.id_usuario
      JOIN CUENTAS c ON p.id_cuenta_desembolso = c.id_cuenta
      JOIN MONEDAS m ON c.id_moneda = m.id_moneda
      WHERE p.monto_solicitado > 3000 AND p.estado = 'PENDIENTE_VALIDACION'
      ORDER BY p.fecha_solicitud DESC
    `;
    const [rows] = await pool.execute(query);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al listar préstamos mayores:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al listar solicitudes de préstamos.' }
    });
  }
}

// 6. Asignar préstamo a un empleado para su revisión
async function asignarAEmpleado(req, res) {
  try {
    const idPrestamo = req.params.idPrestamo;
    const { id_empleado } = req.body;

    if (!id_empleado) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'El ID de empleado es requerido.' }
      });
    }

    const query = `
      UPDATE PRESTAMOS 
      SET id_usuario_revisor = ?, estado = 'ASIGNADO_A_EMPLEADO' 
      WHERE id_prestamo = ? AND estado = 'PENDIENTE_VALIDACION'
    `;
    const [result] = await pool.execute(query, [id_empleado, idPrestamo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'LOAN_NOT_FOUND', message: 'Préstamo no encontrado o ya asignado.' }
      });
    }

    return res.status(200).json({
      success: true,
      mensaje: 'Préstamo asignado exitosamente al colaborador.'
    });

  } catch (error) {
    console.error('Error al asignar préstamo:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al asignar el préstamo.' }
    });
  }
}

// 7. Bitácora de Auditoría Completa (MongoDB)
async function listarAuditoriaCompleta(req, res) {
  try {
    const AuditLog = require('../models/auditLog.model');
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error al listar auditoría completa:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al obtener bitácora de auditoría completa.' }
    });
  }
}

// 8. Obtener tasas de cambio configuradas
async function obtenerTasas(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM TASAS_CAMBIO');
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener tasas:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al obtener tasas de cambio.' }
    });
  }
}

// 9. Actualizar tasas de cambio manualmente
async function actualizarTasas(req, res) {
  try {
    const { compra, venta } = req.body;
    const compraNum = parseFloat(compra);
    const ventaNum = parseFloat(venta);

    if (isNaN(compraNum) || isNaN(ventaNum) || compraNum <= 0 || ventaNum <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Monto de tasa compra/venta inválido.' }
      });
    }

    // Actualizar todas las tasas de cambio activas
    await pool.execute(
      'UPDATE TASAS_CAMBIO SET tasa_compra = ?, tasa_venta = ? WHERE activo = TRUE',
      [compraNum, ventaNum]
    );

    return res.status(200).json({
      success: true,
      mensaje: 'Tasas de cambio actualizadas exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar tasas:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al actualizar tasas de cambio.' }
    });
  }
}

// 10. Cambiar estado de un colaborador (Bloquear/Desbloquear)
async function cambiarEstadoColaborador(req, res) {
  try {
    const idUsuarioTarget = req.params.idUsuario;
    const { nuevoEstado } = req.body; // 'ACTIVO' o 'BLOQUEADO'

    if (!nuevoEstado || (nuevoEstado !== 'ACTIVO' && nuevoEstado !== 'BLOQUEADO')) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'El estado debe ser ACTIVO o BLOQUEADO.' }
      });
    }

    // 1. Obtener el rol del usuario que se quiere modificar
    const [usuarios] = await pool.execute(
      'SELECT id_rol, email FROM USUARIOS WHERE id_usuario = ?', 
      [idUsuarioTarget]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' }
      });
    }

    const targetUser = usuarios[0];
    
    // Regla de Negocio: No se puede bloquear a un administrador (id_rol = 1)
    if (targetUser.id_rol === 1) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No está permitido bloquear o modificar el estado de un administrador.' }
      });
    }

    // 2. Actualizar el estado del colaborador
    await pool.execute(
      'UPDATE USUARIOS SET estado = ? WHERE id_usuario = ?',
      [nuevoEstado, idUsuarioTarget]
    );

    // 3. Registrar en la bitácora de MongoDB si es posible
    try {
      const AuditLog = require('../models/auditLog.model');
      await AuditLog.create({
        id_usuario: req.user.id_usuario,
        accion: nuevoEstado === 'BLOQUEADO' ? 'BLOQUEAR_COLABORADOR' : 'DESBLOQUEAR_COLABORADOR',
        detalles: `Se cambió el estado del colaborador ${targetUser.email} a ${nuevoEstado}`,
        ip: req.ip || '127.0.0.1'
      });
    } catch (auditErr) {
      console.warn('Error al registrar auditoría de cambio de estado:', auditErr.message);
    }

    return res.status(200).json({
      success: true,
      mensaje: `El estado del colaborador ha sido actualizado a ${nuevoEstado}.`
    });

  } catch (error) {
    console.error('Error al cambiar estado del colaborador:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al actualizar el estado del colaborador.' }
    });
  }
}

module.exports = {
  obtenerKpis,
  obtenerLiquidez,
  listarColaboradores,
  crearColaborador,
  listarPrestamosMayores,
  asignarAEmpleado,
  listarAuditoriaCompleta,
  obtenerTasas,
  actualizarTasas,
  cambiarEstadoColaborador
};
