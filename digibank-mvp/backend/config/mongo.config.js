// Configuración de conexión a MongoDB usando Mongoose (ODM)

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digibank_foro';

async function conectarMongoDB() {
  try {
    // Evitar advertencias de consultas en versiones recientes de Mongoose
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Conexión establecida con MongoDB (Mongoose activo).');
  } catch (error) {
    console.error('✗ ERROR de conexión en MongoDB:', error.message);
    process.exit(1); // Detener el servidor si falla la base de datos documental
  }
}

module.exports = {
  conectarMongoDB
};
