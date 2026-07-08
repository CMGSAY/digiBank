// Instancia global de Axios para llamadas de API con soporte de Cookies

import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const axiosInstance = axios.create({
  baseURL: apiURL,
  withCredentials: true // Permite que el navegador envíe la cookie HttpOnly 'jwt' automáticamente
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el backend retorna 401 (Sesión expirada o inválida): redirigir al login solo si estamos en una ruta privada
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      const esRutaPrivada = path.startsWith('/banca') || path.startsWith('/admin') || path.startsWith('/worker');
      if (esRutaPrivada) {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
