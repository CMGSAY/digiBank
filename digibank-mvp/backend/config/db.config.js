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
  charset: 'utf8mb4',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

async function conectarMySQL() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Conexión establecida con MySQL (Pool activo).');
    
    // Migraciones automáticas para la tabla PRESTAMOS (Soporte transaccional)
    try {
      await connection.query(`
        ALTER TABLE PRESTAMOS 
        MODIFY COLUMN estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'PENDIENTE_VALIDACION') DEFAULT 'PENDIENTE'
      `);
      
      try {
        await connection.query('ALTER TABLE PRESTAMOS ADD COLUMN saldo_pendiente DECIMAL(15, 2) NOT NULL DEFAULT 0.00');
      } catch (e) {
        // Columna ya existe o error similar, continuar de forma segura
      }

      try {
        await connection.query('ALTER TABLE PRESTAMOS ADD COLUMN cuota_mensual DECIMAL(15, 2) NOT NULL DEFAULT 0.00');
      } catch (e) {
        // Columna ya existe o error similar, continuar de forma segura
      }

      try {
        await connection.query('ALTER TABLE PRESTAMOS ADD COLUMN fecha_limite_pago DATETIME NULL');
      } catch (e) {
        // Columna ya existe o error similar, continuar de forma segura
      }
      
      console.log('✓ Migraciones automáticas de PRESTAMOS completadas.');
    } catch (migError) {
      console.warn('⚠ Advertencia en migraciones automáticas MySQL:', migError.message);
    }
    
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
