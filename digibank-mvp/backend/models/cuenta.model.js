// cuenta.model.js - Modelo de Acceso a Datos para CUENTAS (MySQL)
// Fusión de account.model.js + cuenta.model.js (anterior)

const { pool } = require('../config/db.config');

/**
 * Obtener las cuentas activas del usuario con el símbolo e ISO de la moneda.
 */
async function obtenerPorUsuario(idUsuario) {
  const query = `
    SELECT c.*, m.codigo_iso, m.simbolo 
    FROM CUENTAS c
    JOIN MONEDAS m ON c.id_moneda = m.id_moneda
    WHERE c.id_usuario = ? AND c.estado != 'CERRADA'
  `;
  const [rows] = await pool.execute(query, [idUsuario]);
  return rows;
}

/**
 * Buscar una cuenta por su número de cuenta único de 10 dígitos.
 */
async function buscarPorNumero(numeroCuenta) {
  const query = `
    SELECT c.*, m.codigo_iso, m.simbolo 
    FROM CUENTAS c
    JOIN MONEDAS m ON c.id_moneda = m.id_moneda
    WHERE c.numero_cuenta = ?
  `;
  const [rows] = await pool.execute(query, [numeroCuenta]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Validar que una cuenta exista y esté activa, retornando número de cuenta y moneda.
 */
async function validarCuenta(numeroCuenta) {
  const query = `
    SELECT c.id_cuenta, c.numero_cuenta, c.id_usuario, m.codigo_iso, m.simbolo
    FROM CUENTAS c
    JOIN MONEDAS m ON c.id_moneda = m.id_moneda
    WHERE c.numero_cuenta = ? AND c.estado = 'ACTIVA'
  `;
  const [rows] = await pool.execute(query, [numeroCuenta]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crear una nueva cuenta monetaria para un usuario.
 */
async function crearCuenta(idUsuario, idMoneda, numeroCuenta, tipoCuenta = 'MONETARIA') {
  const query = `
    INSERT INTO CUENTAS (id_usuario, id_moneda, numero_cuenta, tipo_cuenta, saldo, estado)
    VALUES (?, ?, ?, ?, 0.00, 'ACTIVA')
  `;
  const [result] = await pool.execute(query, [idUsuario, idMoneda, numeroCuenta, tipoCuenta]);
  return result.insertId;
}

/**
 * Obtener la información detallada de una cuenta, incluyendo titular, saldos y reservas.
 */
async function obtenerDetalleCuenta(idCuenta, idUsuario, rolUsuario) {
  const query = `
    SELECT c.*, m.codigo_iso, m.simbolo, u.nombres, u.apellidos
    FROM CUENTAS c
    JOIN MONEDAS m ON c.id_moneda = m.id_moneda
    JOIN USUARIOS u ON c.id_usuario = u.id_usuario
    WHERE c.id_cuenta = ?
  `;
  const [rows] = await pool.execute(query, [idCuenta]);
  if (rows.length === 0) return null;

  const cuenta = rows[0];

  // Si es un CLIENTE, validar que sea el propietario
  if (rolUsuario === 'CLIENTE' && cuenta.id_usuario !== idUsuario) {
    throw { status: 403, message: 'Acceso no autorizado a esta cuenta.' };
  }

  // Simulación de reservas/retenciones
  const reservas = [
    { nombre: 'Retención compras en tránsito', anterior: 150.00, hoy: 150.00 },
    { nombre: 'Reserva garantía de crédito', anterior: 0.00, hoy: 0.00 }
  ];

  const saldoDisponible = parseFloat(cuenta.saldo);
  const totalReservas = reservas.reduce((acc, curr) => acc + curr.hoy, 0);
  const saldoTotal = saldoDisponible + totalReservas;
  const sobregiroAutorizado = cuenta.codigo_iso === 'USD' ? 100.00 : 500.00;

  return {
    id_cuenta: cuenta.id_cuenta,
    numero_cuenta: cuenta.numero_cuenta,
    tipo_cuenta: cuenta.tipo_cuenta,
    codigo_iso: cuenta.codigo_iso,
    simbolo: cuenta.simbolo,
    nombre_titular: `${cuenta.nombres} ${cuenta.apellidos}`.toUpperCase(),
    saldo_disponible: saldoDisponible,
    saldo_total: saldoTotal,
    sobregiro_autorizado: sobregiroAutorizado,
    reservas: reservas
  };
}

async function obtenerTitularPorNumero(numeroCuenta) {
  const query = `
    SELECT u.nombres, u.apellidos 
    FROM CUENTAS c 
    JOIN USUARIOS u ON c.id_usuario = u.id_usuario 
    WHERE c.numero_cuenta = ?
  `;
  const [rows] = await pool.execute(query, [numeroCuenta]);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  obtenerPorUsuario,
  buscarPorNumero,
  validarCuenta,
  crearCuenta,
  obtenerDetalleCuenta,
  obtenerTitularPorNumero
};
