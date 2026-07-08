// Script para inicializar y sembrar las bases de datos de DigiBank MVP en producción/nube.
// Se ejecuta desde la raíz del backend: node scripts/deploy-setup.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

async function main() {
  console.log('=== Iniciando configuración de Bases de Datos en la Nube ===\n');

  // --- 1. Inicialización de MySQL ---
  console.log('1. Conectando a MySQL...');
  
  // Validar variables requeridas de MySQL
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const dbPort = parseInt(process.env.DB_PORT) || 3306;
  const dbSsl = process.env.DB_SSL === 'true';

  if (!dbHost || !dbUser || !dbPassword || !dbName) {
    console.error('✗ ERROR: Faltan variables de entorno para MySQL (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
    process.exit(1);
  }

  const connectionConfig = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true, // Permitir correr todo el archivo SQL a la vez
    ssl: dbSsl ? { rejectUnauthorized: false } : undefined
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✓ Conexión establecida con MySQL.');

    // Leer el archivo dbmysql.md que contiene el DDL y los datos de prueba
    // Está en la raíz del proyecto (dos niveles arriba de backend/scripts)
    const sqlPath = path.join(__dirname, '..', '..', 'dbmysql.md');
    console.log(`Leyendo SQL desde: ${sqlPath}`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`No se encontró el archivo SQL en la ruta: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Ejecutando DDL e insertando semillas en MySQL...');
    await connection.query(sqlContent);
    console.log('✓ Base de datos MySQL configurada e inicializada correctamente.');

  } catch (error) {
    console.error('✗ ERROR configurando MySQL:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a MySQL cerrada.');
    }
  }

  console.log('\n----------------------------------------\n');

  // --- 2. Inicialización de MongoDB ---
  console.log('2. Iniciando configuración de MongoDB Atlas...');
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('✗ ERROR: Falta la variable de entorno MONGODB_URI.');
    process.exit(1);
  }

  try {
    // El script dbmongo.md está en la raíz del proyecto (dos niveles arriba de backend/scripts)
    const mongoScriptPath = path.join(__dirname, '..', '..', 'dbmongo.md');
    console.log(`Ejecutando script de MongoDB desde: ${mongoScriptPath}`);

    if (!fs.existsSync(mongoScriptPath)) {
      throw new Error(`No se encontró el script de MongoDB en la ruta: ${mongoScriptPath}`);
    }

    // Ejecutar el script usando node como un subproceso
    execSync(`node "${mongoScriptPath}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        MONGODB_URI: mongoUri
      }
    });

    console.log('✓ Configuración de MongoDB completada.');

  } catch (error) {
    console.error('✗ ERROR configurando MongoDB:', error.message);
    process.exit(1);
  }

  console.log('\n=== Proceso de configuración de Bases de Datos finalizado con éxito! ===');
}

main().catch((error) => {
  console.error('✗ ERROR crítico en el script de configuración:', error);
  process.exit(1);
});
