// Modelo de Acceso a Datos para la Tabla USUARIOS (MySQL)

const { pool } = require('../config/db.config');

/**
 * Buscar un usuario por su Firebase UID, trayendo también el nombre del rol.
 */
async function buscarPorFirebaseUid(firebaseUid) {
  const query = `
    SELECT u.*, r.nombre_rol 
    FROM USUARIOS u
    JOIN ROLES r ON u.id_rol = r.id_rol
    WHERE u.firebase_uid = ?
  `;
  const [rows] = await pool.execute(query, [firebaseUid]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Buscar un usuario por email.
 */
async function buscarPorEmail(email) {
  const query = `
    SELECT u.*, r.nombre_rol 
    FROM USUARIOS u
    JOIN ROLES r ON u.id_rol = r.id_rol
    WHERE u.email = ?
  `;
  const [rows] = await pool.execute(query, [email]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crear un nuevo usuario en la base de datos (auto-registro de Google OAuth).
 * Rol por defecto: CLIENTE (ID = 4)
 */
async function crearUsuarioGoogle(firebaseUid, nombres, apellidos, email) {
  const query = `
    INSERT INTO USUARIOS (id_rol, firebase_uid, nombres, apellidos, email, debe_cambiar_password, estado)
    VALUES (4, ?, ?, ?, ?, FALSE, 'ACTIVO')
  `;
  const [result] = await pool.execute(query, [firebaseUid, nombres, apellidos, email]);
  return result.insertId;
}

module.exports = {
  buscarPorFirebaseUid,
  buscarPorEmail,
  crearUsuarioGoogle
};
