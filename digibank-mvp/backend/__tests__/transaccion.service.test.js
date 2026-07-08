// Pruebas Unitarias para el Servicio Transaccional (ACID & Rollback)

const transaccionService = require('../services/transaccion.service');
const { pool } = require('../config/db.config');

// Mockear el pool de MySQL para pruebas aisladas
jest.mock('../config/db.config', () => {
  const mockConn = {
    beginTransaction: jest.fn(),
    execute: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
  };
  const mockPool = {
    getConnection: jest.fn(() => Promise.resolve(mockConn)),
    execute: jest.fn()
  };
  return { pool: mockPool };
});

describe('Servicio Transaccional - ejecutarTransferencia', () => {
  let mockConn;
  let saldoOrigenMock = '1000.00';
  let idUsuarioOrigenMock = 10;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConn = await pool.getConnection();
    
    // Valores por defecto para el mock dinámico
    saldoOrigenMock = '1000.00';
    idUsuarioOrigenMock = 10;

    // Mock dinámico de ejecución de consultas SQL
    mockConn.execute.mockImplementation((query, params) => {
      const q = query.toUpperCase();
      if (q.includes('WHERE NUMERO_CUENTA = ?')) {
        return Promise.resolve([[{ id_cuenta: 2, id_usuario: 20, saldo: '200.00', id_moneda: 1, estado: 'ACTIVA' }]]);
      }
      if (q.includes('WHERE ID_CUENTA = ?') && q.includes('FOR UPDATE')) {
        const id = params[0];
        if (id === 1) {
          return Promise.resolve([[{ id_cuenta: 1, id_usuario: idUsuarioOrigenMock, saldo: saldoOrigenMock, id_moneda: 1, estado: 'ACTIVA' }]]);
        }
        if (id === 2) {
          return Promise.resolve([[{ id_cuenta: 2, id_usuario: 20, saldo: '200.00', id_moneda: 1, estado: 'ACTIVA' }]]);
        }
      }
      if (q.includes('INSERT INTO TRANSACCIONES')) {
        return Promise.resolve([{ insertId: 55 }]);
      }
      return Promise.resolve([[]]);
    });
  });

  test('Debería transferir fondos exitosamente (ACID Commit)', async () => {
    const resultado = await transaccionService.ejecutarTransferencia(
      1,             // Cuenta Origen
      '0123456785',  // Número Cuenta Destino
      300.00,        // Monto
      'Test exitoso',// Descripción
      10             // ID Usuario Emisor
    );

    expect(resultado.exitoso).toBe(true);
    expect(resultado.transaccion.monto).toBe(300.00);
    expect(mockConn.beginTransaction).toHaveBeenCalledTimes(1);
    expect(mockConn.commit).toHaveBeenCalledTimes(1);
    expect(mockConn.rollback).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalledTimes(1);
  });

  test('Debería cancelar la transferencia (Rollback) si el saldo es insuficiente', async () => {
    // Cuenta origen tiene saldo Q100, se quieren transferir Q300
    saldoOrigenMock = '100.00';

    const resultado = await transaccionService.ejecutarTransferencia(
      1,
      '0123456785',
      300.00,
      'Test fondos insuficientes',
      10
    );

    expect(resultado.exitoso).toBe(false);
    expect(resultado.error_code).toBe('INSUFFICIENT_FUNDS');
    expect(mockConn.rollback).toHaveBeenCalledTimes(1);
    expect(mockConn.commit).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalledTimes(1);
  });

  test('Debería denegar la transferencia (Rollback) si el emisor no es dueño de la cuenta', async () => {
    // Cuenta origen pertenece a id_usuario = 20, pero el emisor es id_usuario = 10
    idUsuarioOrigenMock = 20;

    const resultado = await transaccionService.ejecutarTransferencia(
      1,
      '0123456785',
      100.00,
      'Test fraude de propiedad',
      10 // Emisor intruso
    );

    expect(resultado.exitoso).toBe(false);
    expect(resultado.error_code).toBe('FORBIDDEN_OWNERSHIP');
    expect(mockConn.rollback).toHaveBeenCalledTimes(1);
    expect(mockConn.commit).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalledTimes(1);
  });
});
