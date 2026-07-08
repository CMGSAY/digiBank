// Servicio de Gestión de Cuentas del Frontend

import axiosInstance from './axiosInstance';

/**
 * Obtener las cuentas del usuario logueado.
 */
export const obtenerCuentasUsuario = async () => {
  const response = await axiosInstance.get('/cuentas');
  return response.data;
};

/**
 * Obtener el detalle profundo de una cuenta específica.
 */
export const obtenerDetalleCuenta = async (idCuenta) => {
  const response = await axiosInstance.get(`/cuentas/${idCuenta}/detalle`);
  return response.data;
};

