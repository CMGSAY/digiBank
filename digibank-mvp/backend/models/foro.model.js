// Modelo Mongoose para la colección mensajes_foro (MongoDB)

const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  id_usuario: {
    type: Number,
    required: true
  },
  nombre_usuario: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    default: ''
  },
  mensaje: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  editado: {
    type: Boolean,
    default: false
  },
  fecha_edicion: {
    type: Date,
    default: null
  }
});

// Registrar los índices descritos en la especificación NoSQL
mensajeSchema.index({ timestamp: -1 });
mensajeSchema.index({ id_usuario: 1 });

const Mensaje = mongoose.model('Mensaje', mensajeSchema, 'mensajes_foro');

module.exports = Mensaje;
