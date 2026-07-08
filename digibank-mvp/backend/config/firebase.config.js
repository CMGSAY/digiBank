// Inicialización de Firebase Admin SDK

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ruta local del archivo de credenciales del Service Account de Firebase
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

// Evitar que el SDK de Firebase intente usar la variable de entorno GOOGLE_APPLICATION_CREDENTIALS si el archivo no existe
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const absoluteEnvPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ? process.env.GOOGLE_APPLICATION_CREDENTIALS
    : path.resolve(__dirname, '..', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!fs.existsSync(absoluteEnvPath)) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
}

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✓ Firebase Admin SDK inicializado usando archivo de credenciales.');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log('✓ Firebase Admin SDK inicializado usando variables de entorno.');
  } else {
    // Modo sandbox preventivo para que el servidor local pueda iniciar sin credenciales de Firebase
    console.warn('⚠ ADVERTENCIA: No se detectaron credenciales de Firebase. Inicializando en MODO SIMULACIÓN (Sandbox).');
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'digibank-mvp-sandbox'
    });
    admin.esSandbox = true;
  }
} catch (error) {
  console.error('✗ ERROR al inicializar Firebase Admin SDK:', error.message);
}

if (!admin.hasOwnProperty('esSandbox')) {
  admin.esSandbox = false;
}

module.exports = admin;
