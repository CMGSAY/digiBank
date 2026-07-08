// Modelo de Acceso a Datos para Transacciones Bancarias (MySQL)

const { pool } = require('../config/db.config');

/**
 * Obtiene las transacciones de una cuenta filtradas por mes y año.
 * También verifica la propiedad de la cuenta si el usuario es un CLIENTE.
 */
async function obtenerHistorialPorMes(idCuenta, idUsuario, rolUsuario, mes, anio) {
  // 1. Validar propiedad de la cuenta
  const [cuentas] = await pool.execute('SELECT id_usuario FROM CUENTAS WHERE id_cuenta = ?', [idCuenta]);
  if (cuentas.length === 0) {
    throw { status: 404, message: 'Cuenta no encontrada.' };
  }

  if (rolUsuario === 'CLIENTE' && cuentas[0].id_usuario !== idUsuario) {
    throw { status: 403, message: 'Acceso no autorizado al historial de esta cuenta.' };
  }

  // 2. Consulta filtrada por mes y año
  const query = `
    SELECT t.*, 
           co.numero_cuenta AS cuenta_origen, 
           cd.numero_cuenta AS cuenta_destino
    FROM TRANSACCIONES t
    LEFT JOIN CUENTAS co ON t.id_cuenta_origen = co.id_cuenta
    JOIN CUENTAS cd ON t.id_cuenta_destino = cd.id_cuenta
    WHERE (t.id_cuenta_origen = ? OR t.id_cuenta_destino = ?)
      AND MONTH(t.fecha) = ?
      AND YEAR(t.fecha) = ?
    ORDER BY t.fecha DESC
  `;
  
  const [rows] = await pool.execute(query, [
    idCuenta, 
    idCuenta, 
    parseInt(mes), 
    parseInt(anio)
  ]);
  
  return rows;
}

module.exports = {
  obtenerHistorialPorMes
};
