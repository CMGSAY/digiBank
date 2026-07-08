// Controlador para el Foro Colaborativo (MongoDB)

const Mensaje = require('../models/foro.model');

/**
 * Obtener los últimos 50 mensajes de foro (para la carga inicial).
 */
async function obtenerMensajes(req, res) {
  try {
    const mensajes = await Mensaje.find()
      .sort({ timestamp: -1 })
      .limit(50);
    
    // Devolvemos en orden cronológico ascendente para el chat en el cliente
    mensajes.reverse();

    return res.status(200).json({
      success: true,
      data: mensajes
    });
  } catch (error) {
    console.error('Error en obtenerMensajes controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FORUM_FETCH_FAILED', message: 'Error interno al consultar foro.' }
    });
  }
}

/**
 * Guardar un mensaje enviado por REST API (Alternativo a WebSockets).
 */
async function crearMensajeHttp(req, res) {
  try {
    const { id_usuario, nombres, apellidos } = req.user;
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'El contenido del mensaje no puede estar vacío.' }
      });
    }

    const nuevoMensaje = new Mensaje({
      id_usuario,
      nombre_usuario: `${nombres} ${apellidos}`,
      mensaje: mensaje.trim()
    });

    await nuevoMensaje.save();

    return res.status(201).json({
      success: true,
      data: nuevoMensaje
    });
  } catch (error) {
    console.error('Error en crearMensajeHttp controller:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FORUM_SAVE_FAILED', message: 'Error al registrar el mensaje del foro.' }
    });
  }
}

module.exports = {
  obtenerMensajes,
  crearMensajeHttp
};
