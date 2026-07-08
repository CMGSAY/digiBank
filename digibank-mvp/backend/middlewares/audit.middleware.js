// Middleware inmutable de registro de auditoría (AUDIT_LOG - Híbrido MySQL/MongoDB)

const { pool } = require('../config/db.config');
const AuditLog = require('../models/auditLog.model');

function registrarAuditoria(accion) {
  return async (req, res, next) => {
    // Interceptar la respuesta JSON de Express
    const originalJson = res.json;

    res.json = function (data) {
      res.json = originalJson; // Restaurar el método original

      // Procesar e insertar la auditoría asíncronamente en segundo plano (process.nextTick)
      // para no bloquear o ralentizar la respuesta HTTP financiera
      process.nextTick(async () => {
        try {
          const idUsuario = req.user ? req.user.id_usuario : null;
          const rolUsuario = req.user ? req.user.rol : 'INVITADO';
          const ipOrigen = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
          const endpoint = req.originalUrl;
          const userAgent = req.headers['user-agent'] || '';

          // Sanitizar contraseñas y datos sensibles del request body antes de guardarlos
          const detalleJson = { ...req.body };
          if (detalleJson.password) delete detalleJson.password;
          if (detalleJson.password_confirmacion) delete detalleJson.password_confirmacion;

          // Determinar resultado según el status code HTTP de la respuesta
          let resultado = 'EXITO';
          if (res.statusCode >= 400) {
            resultado = (res.statusCode === 403 || res.statusCode === 423) ? 'BLOQUEADO' : 'FALLO';
          }

          // 1. Guardar en MongoDB (Colección NoSQL optimizada para volumen)
          const logMongo = new AuditLog({
            id_usuario: idUsuario || 0,
            rol: rolUsuario,
            accion: accion,
            detalles: {
              endpoint,
              resultado,
              status_code: res.statusCode,
              ...detalleJson
            },
            ip_address: ipOrigen,
            user_agent: userAgent
          });
          await logMongo.save();

          // 2. Guardar en MySQL (Tabla relacional heredada)
          const query = `
            INSERT INTO AUDIT_LOG (id_usuario, accion, ip_origen, endpoint, detalle_json, resultado, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
          `;
          await pool.execute(query, [
            idUsuario,
            accion,
            ipOrigen,
            endpoint,
            JSON.stringify(detalleJson),
            resultado
          ]);

        } catch (error) {
          // Capturar fallos de auditoría de forma silenciosa para evitar caídas del servidor
          console.error('✗ ERROR CRÍTICO al guardar Audit Log:', error.message);
        }
      });

      return originalJson.call(this, data);
    };

    next();
  };
}

module.exports = { registrarAuditoria };
