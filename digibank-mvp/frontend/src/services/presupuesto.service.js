// presupuesto.service.js - Servicio del Frontend para la Gestión de Presupuestos y Finanzas Personales

import axiosInstance from './axiosInstance';

/**
 * Obtener el presupuesto del mes actual con los gastos reales agrupados.
 */
export const obtenerPresupuesto = async () => {
  const response = await axiosInstance.get('/presupuestos');
  return response.data;
};

/**
 * Guardar/Actualizar los límites del presupuesto por categoría.
 */
export const guardarLimites = async (categorias) => {
  const response = await axiosInstance.post('/presupuestos/limites', { categorias });
  return response.data;
};
