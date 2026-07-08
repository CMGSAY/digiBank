// auditLog.model.js - Esquema Mongoose para Logs de Auditoría (MongoDB)

const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  id_usuario: { 
    type: Number, 
    required: true 
  },
  rol: { 
    type: String, 
    required: true 
  },
  accion: { 
    type: String, 
    required: true 
  }, // Ej: 'PAGO_PRESTAMO', 'TRANSFERENCIA', 'CONVERSION', 'INICIO_SESION'
  detalles: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  ip_address: { 
    type: String, 
    default: '127.0.0.1' 
  },
  user_agent: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Índices para consultas rápidas de auditoría ordenadas por fecha
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ id_usuario: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
