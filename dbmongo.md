// Script de configuración para MongoDB (Foro y Auditoría de DigiBank MVP)
// Funciona tanto localmente como en base de datos en la nube (MongoDB Atlas)

const { MongoClient } = require('mongodb');

// Toma la URI en línea desde la variable de entorno MONGODB_URI, si no existe usa el fallback local
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digibank_foro';

async function setup() {
  const client = new MongoClient(uri);
  try {
    console.log(`Conectando a MongoDB...`);
    await client.connect();
    console.log(`✓ Conectado exitosamente.`);
    
    // Extrae el nombre de la base de datos de la URI de conexión de Atlas o usa la default
    const db = client.db(); 
    console.log(`Usando base de datos: ${db.databaseName}`);
    
    // 1. Configuración de Mensajes del Foro
    const collectionsForo = await db.listCollections({ name: 'mensajes_foro' }).toArray();
    if (collectionsForo.length === 0) {
      await db.createCollection('mensajes_foro');
    }
    const collectionForo = db.collection('mensajes_foro');
    await collectionForo.createIndex({ timestamp: -1 });
    await collectionForo.createIndex({ id_usuario: 1 });

    // Semilla de Foro
    const countMensajes = await collectionForo.countDocuments();
    if (countMensajes === 0) {
      console.log('Insertando mensajes semilla en Foro...');
      await collectionForo.insertMany([
        {
          id_usuario: 4,
          nombre_usuario: 'Carlos Ortiz',
          mensaje: 'Hola a todos, ¿alguien sabe a qué hora abre la ventanilla del banco los sábados?',
          timestamp: new Date(Date.now() - 3600000 * 2) // Hace 2 horas
        },
        {
          id_usuario: 5,
          nombre_usuario: 'Ana López',
          mensaje: 'Hola Carlos, la ventanilla abre de 9:00 AM a 1:00 PM los sábados.',
          timestamp: new Date(Date.now() - 3600000) // Hace 1 hora
        }
      ]);
      console.log('✓ Mensajes semilla insertados.');
    }

    // 2. Configuración de Presupuestos
    const collectionsPresupuesto = await db.listCollections({ name: 'presupuestos' }).toArray();
    if (collectionsPresupuesto.length === 0) {
      await db.createCollection('presupuestos');
    }
    const collectionPresupuesto = db.collection('presupuestos');
    await collectionPresupuesto.createIndex({ id_usuario: 1, mes_anio: 1 }, { unique: true });

    // Semilla de Presupuestos
    const countPresupuestos = await collectionPresupuesto.countDocuments();
    if (countPresupuestos === 0) {
      console.log('Insertando presupuestos semilla...');
      await collectionPresupuesto.insertOne({
        id_usuario: 4,
        mes_anio: '07-2026',
        limites: {
          comida: 1500,
          transporte: 800,
          servicios: 1200,
          entretenimiento: 600,
          otros: 1000
        }
      });
      console.log('✓ Presupuestos semilla insertados.');
    }

    // 3. Configuración de Auditoría (Logs)
    const collectionsAudit = await db.listCollections({ name: 'auditlogs' }).toArray();
    if (collectionsAudit.length === 0) {
      await db.createCollection('auditlogs');
    }
    const collectionAudit = db.collection('auditlogs');
    await collectionAudit.createIndex({ timestamp: -1 });

    // Semilla de Auditoría
    const countAudit = await collectionAudit.countDocuments();
    if (countAudit === 0) {
      console.log('Insertando bitácora de auditoría semilla...');
      await collectionAudit.insertMany([
        {
          id_usuario: 4,
          rol: 'CLIENTE',
          accion: 'LOGIN',
          ip_address: '192.168.1.15',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          detalles: { correo: 'cliente@digibank.com' },
          timestamp: new Date(Date.now() - 3600000 * 5)
        },
        {
          id_usuario: 2,
          rol: 'TRABAJADOR_OPERACIONES',
          accion: 'DEPOSITO_CAJA',
          ip_address: '192.168.10.2',
          user_agent: 'Chrome 122.0.0',
          detalles: { cuenta_afectada: '0100000001', monto: 15000, moneda: 'GTQ' },
          timestamp: new Date(Date.now() - 3600000 * 4)
        }
      ]);
      console.log('✓ Auditoría semilla insertada.');
    }

    console.log('✓ Configuración e inicialización de MongoDB completada.');

  } catch (error) {
    console.error('✗ Error configurando MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Conexión a MongoDB cerrada.');
  }
}

setup();



