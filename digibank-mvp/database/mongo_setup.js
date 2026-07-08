// Script de configuración para MongoDB (Foro de DigiBank MVP)
// Ejecución: node mongo_setup.js o cargado en el contenedor.

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digibank_foro';

async function setup() {
  const client = new MongoClient(uri);
  try {
    console.log(`Conectando a MongoDB en: ${uri}`);
    await client.connect();
    
    const db = client.db('digibank_foro');
    
    // 1. Crear colección mensajes_foro (si no existe)
    const collectionsForo = await db.listCollections({ name: 'mensajes_foro' }).toArray();
    if (collectionsForo.length === 0) {
      await db.createCollection('mensajes_foro');
      console.log('✓ Colección mensajes_foro creada con éxito.');
    } else {
      console.log('✓ Colección mensajes_foro ya existe.');
    }
    
    const collectionForo = db.collection('mensajes_foro');
    
    // 2. Crear índices para mensajes_foro
    console.log('Creando índices en mensajes_foro...');
    await collectionForo.createIndex({ timestamp: -1 });
    await collectionForo.createIndex({ id_usuario: 1 });

    // 3. Crear colección presupuestos (si no existe)
    const collectionsPresupuesto = await db.listCollections({ name: 'presupuestos' }).toArray();
    if (collectionsPresupuesto.length === 0) {
      await db.createCollection('presupuestos');
      console.log('✓ Colección presupuestos creada con éxito.');
    } else {
      console.log('✓ Colección presupuestos ya existe.');
    }

    const collectionPresupuesto = db.collection('presupuestos');

    // 4. Crear índice compuesto único para presupuestos
    console.log('Creando índice compuesto único en presupuestos...');
    await collectionPresupuesto.createIndex({ id_usuario: 1, mes_anio: 1 }, { unique: true });
    
    const indexesForo = await collectionForo.listIndexes().toArray();
    const indexesPresupuesto = await collectionPresupuesto.listIndexes().toArray();
    console.log('✓ Índices foro configurados correctamente:', JSON.stringify(indexesForo, null, 2));
    console.log('✓ Índices presupuestos configurados correctamente:', JSON.stringify(indexesPresupuesto, null, 2));

  } catch (error) {
    console.error('✗ Error configurando MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Conexión a MongoDB cerrada.');
  }
}

setup();
