// presupuesto.model.js - Esquema Mongoose para la gestión de Presupuestos Mensuales (MongoDB)

const mongoose = require('mongoose');

const CategoriaPresupuestoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  limite: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  color: { 
    type: String, 
    default: '#00A4E0' 
  },
  icono: { 
    type: String, 
    default: 'Info' 
  }
});

const PresupuestoSchema = new mongoose.Schema({
  id_usuario: { 
    type: Number, 
    required: true 
  },
  mes_anio: { 
    type: String, 
    required: true 
  }, // Formato: 'YYYY-MM' (ej: '2026-07')
  categorias: [CategoriaPresupuestoSchema],
  fecha_actualizacion: { 
    type: Date, 
    default: Date.now 
  }
});

// Crear índice compuesto único para evitar duplicación del presupuesto mensual de un usuario
PresupuestoSchema.index({ id_usuario: 1, mes_anio: 1 }, { unique: true });

module.exports = mongoose.model('Presupuesto', PresupuestoSchema);
