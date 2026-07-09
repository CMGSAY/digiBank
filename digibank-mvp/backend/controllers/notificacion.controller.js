// notificacion.controller.js - Controlador de Notificaciones para API

const Notificacion = require('../models/notificacion.model');

async function listarNotificaciones(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const rol = req.user.rol;

    // Buscar notificaciones destinadas al usuario específico OR a su rol en general (con destinatario nulo)
    const notificaciones = await Notificacion.find({
      $or: [
        { id_usuario_destinatario: idUsuario },
        { rol_destinatario: rol, id_usuario_destinatario: null }
      ]
    }).sort({ fecha: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    console.error('Error al listar notificaciones:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al consultar notificaciones.' }
    });
  }
}

async function marcarLeido(req, res) {
  try {
    const { id } = req.params;
    const notif = await Notificacion.findByIdAndUpdate(
      id,
      { leido: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notificación no encontrada.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: notif
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al actualizar notificación.' }
    });
  }
}

async function marcarTodasLeidas(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const rol = req.user.rol;

    await Notificacion.updateMany(
      {
        $or: [
          { id_usuario_destinatario: idUsuario },
          { rol_destinatario: rol, id_usuario_destinatario: null }
        ],
        leido: false
      },
      { leido: true }
    );

    return res.status(200).json({
      success: true,
      mensaje: 'Todas las notificaciones marcadas como leídas.'
    });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error al actualizar notificaciones.' }
    });
  }
}

module.exports = {
  listarNotificaciones,
  marcarLeido,
  marcarTodasLeidas
};
