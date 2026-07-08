// beneficiario.controller.js - Controlador para la gestión de beneficiarios en MySQL

const { pool } = require('../config/db.config');

/**
 * Listar los beneficiarios (cuentas de terceros) del usuario logueado.
 */
async function listarBeneficiarios(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const [rows] = await pool.execute(
      `SELECT b.id_beneficiario as id, b.alias, c.numero_cuenta as numeroCuenta, 
              c.tipo_cuenta as tipoCuenta, m.codigo_iso as moneda, m.simbolo, 
              CONCAT(u.nombres, ' ', u.apellidos) as titular
       FROM BENEFICIARIOS b
       JOIN CUENTAS c ON b.id_cuenta_destino = c.id_cuenta
       JOIN MONEDAS m ON c.id_moneda = m.id_moneda
       JOIN USUARIOS u ON c.id_usuario = u.id_usuario
       WHERE b.id_usuario_propietario = ?`,
      [idUsuario]
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al listar beneficiarios:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al consultar beneficiarios.' }
    });
  }
}

/**
 * Registrar un nuevo beneficiario para el usuario logueado.
 */
async function crearBeneficiario(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { alias, numeroCuenta } = req.body;

    if (!alias || !numeroCuenta) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Alias y número de cuenta son requeridos.' }
      });
    }

    // 1. Validar que la cuenta destino exista
    const [cuentas] = await pool.execute(
      'SELECT id_cuenta, id_usuario FROM CUENTAS WHERE numero_cuenta = ?',
      [numeroCuenta]
    );

    if (cuentas.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'ACCOUNT_NOT_FOUND', message: 'La cuenta destino no existe en DigiBank.' }
      });
    }

    const idCuentaDestino = cuentas[0].id_cuenta;
    const idUsuarioDestino = cuentas[0].id_usuario;

    // Opcional: No permitir agregarse a sí mismo como beneficiario de terceros
    if (idUsuario === idUsuarioDestino) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No puedes agregarte a ti mismo como beneficiario de terceros.' }
      });
    }

    // 2. Validar que no esté duplicado
    const [existentes] = await pool.execute(
      'SELECT id_beneficiario FROM BENEFICIARIOS WHERE id_usuario_propietario = ? AND id_cuenta_destino = ?',
      [idUsuario, idCuentaDestino]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_BENEFICIARY', message: 'Esta cuenta de beneficiario ya se encuentra registrada.' }
      });
    }

    // 3. Insertar nuevo beneficiario
    await pool.execute(
      'INSERT INTO BENEFICIARIOS (id_usuario_propietario, id_cuenta_destino, alias) VALUES (?, ?, ?)',
      [idUsuario, idCuentaDestino, alias.trim()]
    );

    return res.status(201).json({
      success: true,
      message: '✓ Beneficiario registrado con éxito.'
    });
  } catch (error) {
    console.error('Error al crear beneficiario:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al registrar el beneficiario.' }
    });
  }
}

/**
 * Eliminar un beneficiario.
 */
async function eliminarBeneficiario(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idBeneficiario = req.params.id;

    const [result] = await pool.execute(
      'DELETE FROM BENEFICIARIOS WHERE id_beneficiario = ? AND id_usuario_propietario = ?',
      [idBeneficiario, idUsuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'BENEFICIARY_NOT_FOUND', message: 'Beneficiario no encontrado o no autorizado.' }
      });
    }

    return res.status(200).json({
      success: true,
      message: '✓ Beneficiario removido.'
    });
  } catch (error) {
    console.error('Error al eliminar beneficiario:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al eliminar el beneficiario.' }
    });
  }
}

module.exports = {
  listarBeneficiarios,
  crearBeneficiario,
  eliminarBeneficiario
};
