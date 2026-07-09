// Contexto de Autenticación React para DigiBank MVP

import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../services/axiosInstance';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 1. Verificar la sesión del usuario al montar el componente
  const chequearSesion = async () => {
    try {
      // Intentar pedir la información de sesión local al backend
      // (el backend valida la cookie jwt HttpOnly automáticamente)
      const response = await axiosInstance.get('/auth/me');
      if (response.data && response.data.success) {
        setUsuario(response.data.data.usuario);
      }
    } catch (error) {
      // Fallback local para desarrollo en Sandbox (localhost sin backend de auth real)
      const savedUser = localStorage.getItem('digibank_sandbox_user');
      if (savedUser) {
        setUsuario(JSON.parse(savedUser));
      } else {
        setUsuario(null);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    chequearSesion();
  }, []);

  // 2. Método de Login con Google OAuth
  const loginConGoogle = async (inputEmail, password) => {
    try {
      setCargando(true);
      let token = '';
      let email = '';
      let name = '';

      const isSandbox = import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('sandbox') || !import.meta.env.VITE_FIREBASE_API_KEY;

      if (isSandbox) {
        // Simulación en local sin abrir popup real de Firebase
        const username = inputEmail ? inputEmail.trim() : 'cliente';
        token = `mock-token-${username}`;
        email = username.includes('@') ? username : `${username}@digibank.com`;
        name = username.startsWith('cliente') 
          ? 'Carlos Ortiz' 
          : (username.startsWith('empleado') ? 'Empleado Ventanilla' : 'Administrador General');
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        token = await result.user.getIdToken();
        email = result.user.email;
        name = result.user.displayName;
      }

      // Enviar token de Google/Mock y contraseña al backend local
      const response = await axiosInstance.post('/auth/google', { 
        google_token: token,
        password: password
      });

      if (response.data && response.data.success) {
        const userObj = response.data.data.usuario;
        setUsuario(userObj);
        if (isSandbox) {
          localStorage.setItem('digibank_sandbox_user', JSON.stringify(userObj));
        }
        return { exitoso: true, usuario: userObj };
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setCargando(false);
    }
  };

  // 3. Método de Logout
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      // Ignorar fallos de red en logout
    } finally {
      // Limpiar estados locales siempre
      if (!import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('sandbox')) {
        await fbSignOut(auth).catch(() => {});
      }
      localStorage.removeItem('digibank_sandbox_user');
      setUsuario(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };


  return (
    <AuthContext.Provider value={{ usuario, cargando, loginConGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
