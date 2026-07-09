// notificacion.service.js - Servicio para crear notificaciones en MongoDB

const Notificacion = require('../models/notificacion.model');

async function crearNotificacion(titulo, mensaje, rolDestinatario = null, idUsuarioDestinatario = null, tipo = 'GENERAL', idReferencia = null) {
  try {
    const notif = new Notificacion({
      id_usuario_destinatario: idUsuarioDestinatario,
      rol_destinatario: rolDestinatario,
      titulo,
      mensaje,
      tipo,
      id_referencia: idReferencia
    });
    await notif.save();
    return notif;
  } catch (error) {
    console.error('Error al crear notificación en MongoDB:', error);
  }
}

module.exports = {
  crearNotificacion
};
