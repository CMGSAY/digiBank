// Servicio de Transacciones del Frontend

import axiosInstance from './axiosInstance';

/**
 * Realizar transferencia a terceros.
 */
export const transferirFondos = async (payload) => {
  const response = await axiosInstance.post('/transacciones/transferencia', payload);
  return response.data;
};

/**
 * Realizar conversión de divisas.
 */
export const convertirDivisas = async (payload) => {
  const response = await axiosInstance.post('/transacciones/conversion', payload);
  return response.data;
};

/**
 * Obtener historial paginado para una cuenta.
 */
export const obtenerHistorialTransacciones = async (idCuenta, page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/transacciones/historial?id_cuenta=${idCuenta}&page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Obtener historial de movimientos filtrado por mes y año para una cuenta.
 */
export const obtenerHistorialPorMes = async (idCuenta, mes, anio) => {
  const response = await axiosInstance.get(
    `/transacciones/historial/${idCuenta}?mes=${mes}&anio=${anio}`
  );
  return response.data;
};

