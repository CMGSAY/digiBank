// Configuración del Pool de conexiones a MySQL usando mysql2/promise

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_secure_pass',
  database: process.env.DB_NAME || 'digibank_mvp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function conectarMySQL() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Conexión establecida con MySQL (Pool activo).');
    connection.release();
    return pool;
  } catch (error) {
    console.error('✗ ERROR de conexión en MySQL:', error.message);
    process.exit(1); // Detener el servidor si falla la base de datos transaccional
  }
}

module.exports = {
  pool,
  conectarMySQL
};
