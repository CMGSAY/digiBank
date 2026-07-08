// Entry point del Servidor Express (DigiBank MVP)

require('dotenv').config(); // Cargar variables de entorno obligatoriamente al inicio

// Validar que se use un secreto seguro en entornos de producción
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('super_secret') || process.env.JWT_SECRET.length < 32)) {
  console.error('✗ ERROR DE CONFIGURACIÓN DE SEGURIDAD CRÍTICA: Debe configurar un JWT_SECRET robusto y único en producción (mínimo 32 caracteres).');
  process.exit(1);
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { conectarMySQL } = require('./config/db.config');
const { conectarMongoDB } = require('./config/mongo.config');
const Mensaje = require('./models/foro.model');
const { limiterGeneral, limiterAuth } = require('./middlewares/rateLimiter.middleware');

const app = express();
const server = http.createServer(app);

// Confiar en el proxy en producción para habilitar cookies seguras a través de HTTPS
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Configuración del servidor Socket.io para comunicación bidireccional (Foro)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// 1. Aplicar Middlewares de Seguridad y Parsing globales
app.use(helmet()); // Cabeceras de seguridad HTTP por defecto
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Permite el viaje de cookies en peticiones CORS
}));
app.use(express.json({ limit: '10kb' })); // Parseo de JSON con límite de carga
app.use(cookieParser()); // Parseo de cookies (requerido para cookie jwt)

// Rate limiting global (protección contra DDoS y fuerza bruta)
app.use('/api/v1', limiterGeneral);

// 2. Conectar Rutas de la API de DigiBank MVP
app.use('/api/v1/auth', limiterAuth, require('./routes/auth.routes'));
app.use('/api/v1/transacciones', require('./routes/transaccion.routes'));
app.use('/api/v1/foro', require('./routes/foro.routes'));
app.use('/api/v1/cuentas', require('./routes/cuenta.routes'));
app.use('/api/v1/divisas', require('./routes/divisas.routes'));
app.use('/api/v1/prestamos', require('./routes/prestamo.routes'));
app.use('/api/v1/presupuestos', require('./routes/presupuesto.routes'));
app.use('/api/v1/worker', require('./routes/trabajador.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/beneficiarios', require('./routes/beneficiario.routes'));

// Ruta de Salud Pública (Health Check)
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      timestamp: new Date(),
      message: 'DigiBank MVP Backend está en línea.'
    }
  });
});

// 3. Configuración de Canales y Eventos de Socket.io (Foro en tiempo real)
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado a Socket.io: ${socket.id}`);

  // Evento para recibir nuevos mensajes del foro por WebSockets
  socket.on('nuevo_mensaje', async (data) => {
    try {
      const { id_usuario, nombre_usuario, mensaje } = data;

      if (!mensaje || mensaje.trim().length === 0) return;

      // Sanitizar contra Stored XSS eliminando cualquier etiqueta HTML o Script
      const mensajeSanitizado = mensaje.replace(/<[^>]*>/g, '').trim();
      if (mensajeSanitizado.length === 0) return;

      const mensajeGuardado = new Mensaje({
        id_usuario,
        nombre_usuario,
        mensaje: mensajeSanitizado
      });

      await mensajeGuardado.save();

      // Transmitir en tiempo real a todos los clientes conectados
      io.emit('mensaje_recibido', mensajeGuardado);

    } catch (err) {
      console.error('Error al guardar y emitir mensaje vía WebSockets:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado de Socket.io: ${socket.id}`);
  });
});

// 4. Inicializar Conexión de Bases de Datos y Arrancar Servidor
async function iniciarServidor() {
  try {
    // Conectar bases de datos locales
    await conectarMySQL();
    await conectarMongoDB();

    // Arrancar el listener HTTP
    server.listen(PORT, () => {
      console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ ERROR crítico al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

// Controlar rechazos de promesas no capturados
process.on('unhandledRejection', (err) => {
  console.error('✗ UNHANDLED REJECTION! Deteniendo el servidor de forma segura...', err);
  server.close(() => {
    process.exit(1);
  });
});

iniciarServidor();
