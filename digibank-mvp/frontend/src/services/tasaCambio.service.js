// tasaCambio.service.js - Servicio del Frontend para Tipos de Cambio / Divisas

import axiosInstance from './axiosInstance';

/**
 * Obtiene el tipo de cambio del dólar desde el backend.
 * Retorna fallback local estático si falla la petición al backend.
 */
export const obtenerTipoCambioActual = async () => {
  try {
    const response = await axiosInstance.get('/divisas/actual');
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error('Formato de respuesta inválido.');
  } catch (error) {
    console.warn('Error al consumir endpoint /divisas/actual, usando fallback local de emergencia:', error.message);
    
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaFallback = `${dia}/${mes}/${anio}`;

    return {
      success: true,
      fallback: true,
      data: {
        fecha: fechaFallback,
        referencia: 7.76,
        compra: 7.74,
        venta: 7.82
      }
    };
  }
};
