// prestamo.model.js - Modelo de Acceso a Datos para PRESTAMOS (MySQL)

const { pool } = require('../config/db.config');

/**
 * Registrar una nueva solicitud de préstamo.
 */
async function registrarSolicitud(payload) {
  const {
    id_usuario_solicitante,
    id_cuenta_desembolso,
    monto_solicitado,
    ingresos_declarados,
    estado,
    saldo_pendiente,
    cuota_mensual,
    fecha_limite_pago
  } = payload;

  const query = `
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

  const [result] = await pool.execute(query, [
    id_usuario_solicitante,
    id_cuenta_desembolso,
    monto_solicitado,
    ingresos_declarados,
    estado,
    saldo_pendiente,
    cuota_mensual,
    fecha_limite_pago
  ]);

  return result.insertId;
}

/**
 * Obtener todos los préstamos asociados a un usuario.
 */
async function obtenerPorUsuario(idUsuario) {
  const query = `
    SELECT p.*, c.numero_cuenta AS numero_cuenta_desembolso
    FROM PRESTAMOS p
    JOIN CUENTAS c ON p.id_cuenta_desembolso = c.id_cuenta
    WHERE p.id_usuario_solicitante = ?
    ORDER BY p.fecha_solicitud DESC
  `;
  const [rows] = await pool.execute(query, [idUsuario]);
  return rows;
}

/**
 * Obtener un préstamo por su ID.
 */
async function obtenerPorId(idPrestamo) {
  const query = `
    SELECT p.*, c.numero_cuenta AS numero_cuenta_desembolso, c.id_moneda, m.simbolo
    FROM PRESTAMOS p
    JOIN CUENTAS c ON p.id_cuenta_desembolso = c.id_cuenta
    JOIN MONEDAS m ON c.id_moneda = m.id_moneda
    WHERE p.id_prestamo = ?
  `;
  const [rows] = await pool.execute(query, [idPrestamo]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualizar el saldo pendiente y la fecha de pago de un préstamo.
 */
async function pagarCuota(idPrestamo, nuevoSaldo, nuevaFechaLimite) {
  const query = `
    UPDATE PRESTAMOS 
    SET saldo_pendiente = ?, fecha_limite_pago = ?
    WHERE id_prestamo = ?
  `;
  const [result] = await pool.execute(query, [nuevoSaldo, nuevaFechaLimite, idPrestamo]);
  return result.affectedRows > 0;
}

/**
 * Actualizar el estado de un préstamo (ej. APROBADO, RECHAZADO, PENDIENTE_VALIDACION).
 */
async function actualizarEstado(idPrestamo, nuevoEstado, idRevisor = null, comentario = null) {
  const query = `
    UPDATE PRESTAMOS 
    SET estado = ?, id_usuario_revisor = ?, comentario_revisor = ?, fecha_resolucion = NOW()
    WHERE id_prestamo = ?
  `;
  const [result] = await pool.execute(query, [nuevoEstado, idRevisor, comentario, idPrestamo]);
  return result.affectedRows > 0;
}

module.exports = {
  registrarSolicitud,
  obtenerPorUsuario,
  obtenerPorId,
  pagarCuota,
  actualizarEstado
};
