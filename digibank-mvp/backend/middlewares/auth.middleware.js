// Middleware de autenticación usando Firebase Auth ID Token

const admin = require('../config/firebase.config');
const { pool } = require('../config/db.config');

async function verificarToken(req, res, next) {
  try {
    // 1. Extraer el token de las cookies o de la cabecera Authorization
    let token = req.cookies ? req.cookies.jwt : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Acceso no autorizado. Sesión no iniciada.'
        }
      });
    }

    let decodedToken;

    // Verificar si Firebase está en modo Simulación (sandbox) y procesar token simulado
    const esSandbox = process.env.NODE_ENV !== 'production' && admin.esSandbox;
    if (esSandbox && token.startsWith('mock-token-')) {
      const mockEmail = token.split('mock-token-')[1];
      const normalizedEmail = mockEmail.includes('@') ? mockEmail : `${mockEmail}@digibank.com`;
      const prefix = normalizedEmail.split('@')[0];
      decodedToken = {
        uid: `firebase-uid-${prefix}`,
        email: normalizedEmail,
        name: `Usuario Simulado ${prefix}`
      };
    } else {
      // Verificación real usando Firebase Admin SDK
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err) {
        if (err.code === 'auth/id-token-expired') {
          return res.status(401).json({
            success: false,
            error: { code: 'TOKEN_EXPIRED', message: 'La sesión de Firebase ha expirado.' }
          });
        }
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_INVALID', message: 'Sesión inválida.' }
        });
      }
    }

    // 2. Buscar al usuario correspondiente en la base de datos relacional MySQL
    // (Consistencia e integridad: se usa el pool de conexiones con promesas)
    const [usuarios] = await pool.execute(
      `SELECT u.*, r.nombre_rol 
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       WHERE u.firebase_uid = ? OR u.email = ?`,
      [decodedToken.uid, decodedToken.email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_REGISTERED',
          message: 'El usuario no se encuentra registrado en el sistema local de DigiBank.'
        }
      });
    }

    const usuario = usuarios[0];

    // 3. Validar estado de la cuenta local
    if (usuario.estado === 'BLOQUEADO') {
      return res.status(423).json({
        success: false,
        error: { code: 'ACCOUNT_LOCKED', message: 'Tu cuenta se encuentra bloqueada preventivamente.' }
      });
    } else if (usuario.estado === 'INACTIVO') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'Tu cuenta se encuentra inactiva.' }
      });
    }

    // 4. Inyectar datos en req.user para controladores posteriores
    req.user = {
      id_usuario: usuario.id_usuario,
      rol: usuario.nombre_rol,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      firebase_uid: decodedToken.uid
    };

    next();

  } catch (error) {
    console.error('Error en verificarToken middleware:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error de servidor durante la autenticación.' }
    });
  }
}

module.exports = { verificarToken };
