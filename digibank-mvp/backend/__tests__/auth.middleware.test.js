// Pruebas para el Middleware de Autenticación de Firebase y Base Local

const { verificarToken } = require('../middlewares/auth.middleware');
const admin = require('../config/firebase.config');
const { pool } = require('../config/db.config');

// Mockear Firebase Admin SDK
jest.mock('../config/firebase.config', () => {
  const mockAuthObj = {
    verifyIdToken: jest.fn()
  };
  return {
    app: () => ({
      options: { projectId: 'test-project-real' }
    }),
    auth: () => mockAuthObj
  };
});

// Mockear el pool de MySQL
jest.mock('../config/db.config', () => {
  return {
    pool: {
      execute: jest.fn()
    }
  };
});

describe('Middleware de Autenticación - verificarToken', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      cookies: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('Debería retornar 401 si no se envía ningún token', async () => {
    await verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'TOKEN_MISSING' })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('Debería llamar a next() e inyectar req.user si el token es válido y la cuenta local está ACTIVA', async () => {
    req.headers.authorization = 'Bearer token-firebase-valido';

    // Mock de decodificación de Firebase
    admin.auth().verifyIdToken.mockResolvedValueOnce({
      uid: 'firebase-uid-100',
      email: 'carlos@digibank.com'
    });

    // Mock de consulta a base de datos local
    pool.execute.mockResolvedValueOnce([[{
      id_usuario: 15,
      firebase_uid: 'firebase-uid-100',
      nombres: 'Carlos',
      apellidos: 'Ortiz',
      email: 'carlos@digibank.com',
      estado: 'ACTIVO',
      nombre_rol: 'CLIENTE'
    }]]);

    await verificarToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      id_usuario: 15,
      rol: 'CLIENTE',
      email: 'carlos@digibank.com',
      nombres: 'Carlos',
      apellidos: 'Ortiz',
      firebase_uid: 'firebase-uid-100'
    });
  });

  test('Debería retornar 423 si la cuenta del usuario local está bloqueada preventivamente', async () => {
    req.headers.authorization = 'Bearer token-usuario-bloqueado';

    admin.auth().verifyIdToken.mockResolvedValueOnce({
      uid: 'firebase-uid-200',
      email: 'bloqueado@digibank.com'
    });

    pool.execute.mockResolvedValueOnce([[{
      id_usuario: 16,
      firebase_uid: 'firebase-uid-200',
      nombres: 'Usuario',
      apellidos: 'Bloqueado',
      email: 'bloqueado@digibank.com',
      estado: 'BLOQUEADO',
      nombre_rol: 'CLIENTE'
    }]]);

    await verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(423);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'ACCOUNT_LOCKED' })
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
