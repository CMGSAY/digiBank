// notificacion.model.js - Esquema Mongoose para Notificaciones (MongoDB)

const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
  id_usuario_destinatario: { 
    type: Number, 
    default: null // null significa que va dirigido a un rol completo o no es específico de un usuario individual
  },
  rol_destinatario: { 
    type: String, 
    enum: ['ADMIN', 'TRABAJADOR_OPERACIONES', 'CLIENTE', null],
    default: null 
  },
  titulo: { 
    type: String, 
    required: true 
  },
  mensaje: { 
    type: String, 
    required: true 
  },
  leido: { 
    type: Boolean, 
    default: false 
  },
  tipo: { 
    type: String, 
    default: 'GENERAL' // 'PRESTAMO_PENDIENTE', 'PRESTAMO_ASIGNADO', 'PRESTAMO_RESOLVIDO'
  },
  id_referencia: { 
    type: Number, 
    default: null 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

NotificacionSchema.index({ fecha: -1 });
NotificacionSchema.index({ id_usuario_destinatario: 1, leido: 1 });

module.exports = mongoose.model('Notificacion', NotificacionSchema);
