// prestamo.service.js - Servicio del Frontend para la Gestión de Préstamos

import axiosInstance from './axiosInstance';

/**
 * Obtener todos los préstamos asociados al cliente logueado.
 */
export const obtenerPrestamos = async () => {
  const response = await axiosInstance.get('/prestamos');
  return response.data;
};

/**
 * Enviar solicitud de préstamo.
 */
export const solicitarPrestamo = async (payload) => {
  const response = await axiosInstance.post('/prestamos/solicitar', payload);
  return response.data;
};

/**
 * Realizar el pago de la cuota de un préstamo.
 */
export const pagarPrestamo = async (idPrestamo, payload) => {
  const response = await axiosInstance.post(`/prestamos/${idPrestamo}/pagar`, payload);
  return response.data;
};
