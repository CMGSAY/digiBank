// Configuración general de Jest para el Backend de DigiBank MVP

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};
