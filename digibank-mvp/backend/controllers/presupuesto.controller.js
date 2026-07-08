// presupuesto.controller.js - Controlador para Finanzas Personales y Presupuestos (Híbrido MySQL/MongoDB)

const Presupuesto = require('../models/presupuesto.model');
const { pool } = require('../config/db.config');

/**
 * Obtener presupuesto del mes actual, calculando gastos reales desde MySQL.
 */
async function obtenerPresupuesto(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    // Usar la fecha actual del sistema. En entorno local es Julio 2026.
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const mesAnio = `${anio}-${mes}`;

    // 1. Obtener límites de MongoDB
    let presupuesto = await Presupuesto.findOne({ id_usuario: idUsuario, mes_anio: mesAnio });

    if (!presupuesto) {
      // Si no existe el presupuesto para este mes, inicializar valores por defecto
      presupuesto = new Presupuesto({
        id_usuario: idUsuario,
        mes_anio: mesAnio,
        categorias: [
          { nombre: 'Restaurantes', limite: 300.00, color: '#00A4E0', icono: 'Utensils' },
          { nombre: 'Tiendas por Departamentos', limite: 150.00, color: '#F59E0B', icono: 'ShoppingBag' },
          { nombre: 'Transferencias y Pagos', limite: 50.00, color: '#10B981', icono: 'Send' },
          { nombre: 'Suscripciones y Apps', limite: 50.00, color: '#EF4444', icono: 'Sparkles' }
        ]
      });
      await presupuesto.save();
    }

    // 2. Consultar gastos reales (egresos) de MySQL para el mes actual
    const sqlQuery = `
      SELECT t.monto_origen, t.descripcion, t.tipo
      FROM TRANSACCIONES t
      JOIN CUENTAS c ON t.id_cuenta_origen = c.id_cuenta
      WHERE c.id_usuario = ?
        AND MONTH(t.fecha) = ?
        AND YEAR(t.fecha) = ?
        AND t.estado = 'COMPLETADA'
    `;
    const [rows] = await pool.execute(sqlQuery, [idUsuario, parseInt(mes), anio]);

    // 3. Clasificar gastos programáticamente por palabras clave en la descripción
    let totalRestaurantes = 0;
    let totalTiendas = 0;
    let totalSuscripciones = 0;
    let totalTransferencias = 0;

    rows.forEach(t => {
      const monto = parseFloat(t.monto_origen);
      const desc = (t.descripcion || '').toLowerCase();
      
      if (/restaurante|comida|cafe|food|pizza|burger|mcdonald|burguer|starbucks|cena|almuerzo/i.test(desc)) {
        totalRestaurantes += monto;
      } else if (/tienda|departamento|zara|ropa|walmart|mall|distribuidor|super|compras|tiendas/i.test(desc)) {
        totalTiendas += monto;
      } else if (/suscripcion|netflix|spotify|amazon|cloud|hbo|apple|app|membresia/i.test(desc)) {
        totalSuscripciones += monto;
      } else {
        // Fallback para transferencias ordinarias y otros débitos
        totalTransferencias += monto;
      }
    });

    // 4. Fusionar límites de MongoDB con gastos acumulados de MySQL
    const datosFusionados = presupuesto.categorias.map(cat => {
      let gastado = 0;
      if (cat.nombre === 'Restaurantes') gastado = totalRestaurantes;
      else if (cat.nombre === 'Tiendas por Departamentos') gastado = totalTiendas;
      else if (cat.nombre === 'Suscripciones y Apps') gastado = totalSuscripciones;
      else if (cat.nombre === 'Transferencias y Pagos') gastado = totalTransferencias;

      return {
        id: cat._id,
        nombre: cat.nombre,
        limite: cat.limite,
        gastado: Number(gastado.toFixed(2)),
        color: cat.color,
        icono: cat.icono
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        mes_anio: mesAnio,
        categorias: datosFusionados
      }
    });

  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al calcular finanzas personales.' }
    });
  }
}

/**
 * Actualizar los límites de presupuesto de las categorías del usuario.
 */
async function guardarLimites(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { categorias } = req.body; // Array: [{ nombre: 'Restaurantes', limite: 300 }]

    if (!categorias || !Array.isArray(categorias)) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Categorías no proporcionadas o formato inválido.' }
      });
    }

    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const mesAnio = `${anio}-${mes}`;

    // Buscar presupuesto existente
    let presupuesto = await Presupuesto.findOne({ id_usuario: idUsuario, mes_anio: mesAnio });

    if (!presupuesto) {
      presupuesto = new Presupuesto({
        id_usuario: idUsuario,
        mes_anio: mesAnio,
        categorias: [
          { nombre: 'Restaurantes', limite: 300.00, color: '#00A4E0', icono: 'Utensils' },
          { nombre: 'Tiendas por Departamentos', limite: 150.00, color: '#F59E0B', icono: 'ShoppingBag' },
          { nombre: 'Transferencias y Pagos', limite: 50.00, color: '#10B981', icono: 'Send' },
          { nombre: 'Suscripciones y Apps', limite: 50.00, color: '#EF4444', icono: 'Sparkles' }
        ]
      });
    }

    // Actualizar límites recibidos
    categorias.forEach(catBody => {
      const cat = presupuesto.categorias.find(c => c.nombre === catBody.nombre);
      if (cat) {
        cat.limite = Math.max(0, parseFloat(catBody.limite) || 0);
      }
    });

    presupuesto.fecha_actualizacion = new Date();
    await presupuesto.save();

    return res.status(200).json({
      success: true,
      mensaje: '✓ Límites de presupuesto actualizados exitosamente.'
    });

  } catch (error) {
    console.error('Error al guardar límites de presupuesto:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al actualizar los límites.' }
    });
  }
}

module.exports = {
  obtenerPresupuesto,
  guardarLimites
};
