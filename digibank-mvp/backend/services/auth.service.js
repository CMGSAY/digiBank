// Capa de Servicio para Autenticación e Identidad local-nube

const userModel = require('../models/user.model');
const { pool } = require('../config/db.config');

/**
 * Vincula o registra un perfil de Firebase Auth (Google OAuth) con la base de datos local MySQL.
 * Si el usuario es nuevo, crea su perfil en MySQL y le abre una cuenta de bienvenida en GTQ.
 */
async function vincularOUsuarioGoogle(firebaseUser, password) {
  const { uid, email } = firebaseUser;

  // 1. Intentar buscar al usuario en base de datos local mediante su firebase_uid
  let usuario = await userModel.buscarPorFirebaseUid(uid);

  // 2. Si no se encuentra por uid, buscar por correo electrónico
  if (!usuario) {
    const queryRecuperar = `
      SELECT u.*, r.nombre_rol 
      FROM USUARIOS u
      JOIN ROLES r ON u.id_rol = r.id_rol
      WHERE u.email = ?
    `;
    const [rows] = await pool.execute(queryRecuperar, [email]);
    
    if (rows.length > 0) {
      usuario = rows[0];
      // Vincular el firebase_uid para inicios de sesión posteriores
      await pool.execute('UPDATE USUARIOS SET firebase_uid = ? WHERE id_usuario = ?', [uid, usuario.id_usuario]);
      console.log(`✓ Vinculado usuario existente (${email}) con mock uid: ${uid}`);
    }
  }

  // 3. Si no existe en la base de datos (MySQL), denegar el acceso (no auto-registrar)
  if (!usuario) {
    throw new Error('El correo electrónico ingresado no está registrado en DigiBank.');
  }

  // 4. Validar contraseña si el usuario tiene una contraseña hash registrada en la base de datos
  if (usuario.password_hash && password) {
    const bcrypt = require('bcryptjs');
    const matches = await bcrypt.compare(password, usuario.password_hash);
    if (!matches) {
      throw new Error('La contraseña ingresada es incorrecta.');
    }
  }

  return usuario;
}

module.exports = {
  vincularOUsuarioGoogle
};
