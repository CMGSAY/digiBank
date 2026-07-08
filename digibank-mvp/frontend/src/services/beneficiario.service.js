// beneficiario.service.js - Servicio del Frontend para la gestión de beneficiarios

import axiosInstance from './axiosInstance';

/**
 * Obtener todos los beneficiarios asociados al cliente logueado.
 */
export const obtenerBeneficiarios = async () => {
  const response = await axiosInstance.get('/beneficiarios');
  return response.data;
};

/**
 * Enviar solicitud para registrar un beneficiario.
 */
export const agregarBeneficiario = async (payload) => {
  const response = await axiosInstance.post('/beneficiarios', payload);
  return response.data;
};

/**
 * Remover un beneficiario por su ID.
 */
export const eliminarBeneficiario = async (idBeneficiario) => {
  const response = await axiosInstance.delete(`/beneficiarios/${idBeneficiario}`);
  return response.data;
};
