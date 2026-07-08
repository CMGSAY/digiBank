// Controlador HTTP para el módulo de Autenticación de DigiBank MVP

const authService = require('../services/auth.service');
const admin = require('../config/firebase.config');
const { pool } = require('../config/db.config');

/**
 * Autenticar al usuario usando Google OAuth ID Token o Mock en Sandbox.
 */
async function loginGoogle(req, res) {
  try {
    const { google_token, password } = req.body;

    if (!google_token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token de autenticación requerido.' }
      });
    }

    let firebaseUser;
    const esSandbox = admin.esSandbox;

    // Procesar token simulado si estamos en local/sandbox
    if (esSandbox && google_token.startsWith('mock-token-')) {
      const mockEmail = google_token.split('mock-token-')[1];
      const normalizedEmail = mockEmail.includes('@') ? mockEmail : `${mockEmail}@digibank.com`;
      const prefix = normalizedEmail.split('@')[0];
      firebaseUser = {
        uid: `firebase-uid-${prefix}`,
        email: normalizedEmail,
        name: prefix === 'cliente' ? 'Carlos Ortiz' : 'Usuario Simulado'
      };
    } else {
      // Verificación real con Firebase Admin SDK
      firebaseUser = await admin.auth().verifyIdToken(google_token);
    }

    // Vincular o registrar usuario local en MySQL
    const usuario = await authService.vincularOUsuarioGoogle(firebaseUser, password);

    // Inyectar cookie de JWT de sesión (usamos el token provisto)
    res.cookie('jwt', google_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutos de expiración de sesión
    });

    return res.status(200).json({
      success: true,
      data: {
        usuario: {
          id_usuario: usuario.id_usuario,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          rol: usuario.nombre_rol
        }
      }
    });

  } catch (error) {
    console.error('Error en loginGoogle controller:', error);
    return res.status(401).json({
      success: false,
      error: { message: error.message || 'Error de autenticación. Token inválido o expirado.' }
    });
  }
}

/**
 * Cerrar sesión borrando la cookie de JWT.
 */
async function logout(req, res) {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente.'
  });
}

/**
 * Obtener perfil de sesión actual.
 */
async function obtenerPerfilActual(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'No autenticado.' }
    });
  }
  return res.status(200).json({
    success: true,
    data: {
      usuario: req.user
    }
  });
}

/**
 * Registro público de nuevos clientes desde la pantalla de login.
 */
async function crearClientePublico(req, res) {
  const bcrypt = require('bcryptjs');
  const connection = await pool.getConnection();
  try {
    const { nombres, apellidos, email, dpi, password, moneda } = req.body;
    const montoNum = 0; // Forzado a 0 por defecto para auto-registro público

    if (!nombres || !apellidos || !email || !dpi || !password || !moneda) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Nombres, apellidos, email, DPI, contraseña y moneda son requeridos.' }
      });
    }

    await connection.beginTransaction();

    // 1. Validar que el correo no esté duplicado
    const [existing] = await connection.execute('SELECT id_usuario FROM USUARIOS WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Ya existe un usuario registrado con este correo electrónico.' }
      });
    }

    // 2. Validar que el DPI no esté duplicado
    const [existingDpi] = await connection.execute('SELECT id_usuario FROM USUARIOS WHERE dpi = ?', [dpi]);
    if (existingDpi.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'DPI_EXISTS', message: 'Ya existe un usuario registrado con este número de DPI.' }
      });
    }

    // 3. Cifrar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    const mockUid = `mock-uid-${email.split('@')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;

    const queryUser = `
      INSERT INTO USUARIOS (id_rol, firebase_uid, nombres, apellidos, email, password_hash, debe_cambiar_password, estado, dpi)
      VALUES (4, ?, ?, ?, ?, ?, FALSE, 'ACTIVO', ?)
    `;
    const [resUser] = await connection.execute(queryUser, [mockUid, nombres, apellidos, email, passwordHash, dpi]);
    const idUsuario = resUser.insertId;

    // 4. Generar número de cuenta correlativo secuencial
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
      message: '✓ Cuenta de asociado creada con éxito.'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar cliente público:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al registrar el asociado y crear su cuenta.' }
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  loginGoogle,
  logout,
  obtenerPerfilActual,
  crearClientePublico
};
