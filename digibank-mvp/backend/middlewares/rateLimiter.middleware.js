// rateLimiter.middleware.js — Protección contra ataques de fuerza bruta y DDoS

const rateLimit = require('express-rate-limit');

/**
 * Límite general para todos los endpoints de la API.
 * Permite 100 peticiones por IP cada 15 minutos.
 */
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.'
    }
  }
});

/**
 * Límite estricto para endpoints de autenticación.
 * Permite solo 10 intentos por IP cada 15 minutos (anti-brute-force).
 */
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Demasiados intentos de acceso. Por seguridad, tu cuenta ha sido bloqueada temporalmente. Intenta en 15 minutos.'
    }
  }
});

/**
 * Límite para operaciones financieras críticas (transferencias, pagos).
 * Permite 20 operaciones por IP cada 10 minutos.
 */
const limiterOperaciones = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_FINANCIAL_OPERATIONS',
      message: 'Límite de operaciones financieras alcanzado. Por seguridad, espera 10 minutos.'
    }
  }
});

module.exports = {
  limiterGeneral,
  limiterAuth,
  limiterOperaciones
};
