// Servicio de Autenticación del Frontend

import axiosInstance from './axiosInstance';

/**
 * Enviar token de Firebase o Mock al backend para iniciar sesión.
 */
export const loginConGoogleBackend = async (token) => {
  const response = await axiosInstance.post('/auth/google', { google_token: token });
  return response.data;
};

/**
 * Cerrar sesión en el servidor (remueve la cookie jwt).
 */
export const logoutBackend = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

/**
 * Obtener la información del perfil del usuario logueado.
 */
export const obtenerPerfilUsuario = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
