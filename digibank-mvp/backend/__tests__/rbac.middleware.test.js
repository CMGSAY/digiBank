// Pruebas Unitarias para el Middleware de Control de Roles (RBAC)

const { exigirRoles } = require('../middlewares/rbac.middleware');

describe('Middleware de Control de Roles (RBAC) - exigirRoles', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('Debería llamar a next() si el rol del usuario está en la lista de permitidos', () => {
    req.user = { rol: 'CLIENTE' };
    const middleware = exigirRoles(['CLIENTE', 'ADMIN']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('Debería retornar 403 Forbidden si el rol del usuario no está en la lista', () => {
    req.user = { rol: 'CLIENTE' };
    const middleware = exigirRoles(['ADMIN', 'TRABAJADOR_OPERACIONES']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'FORBIDDEN_ACCESS' })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('Debería retornar 500 si se ejecuta sin haber autenticado previamente al usuario', () => {
    const middleware = exigirRoles(['CLIENTE']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'AUTH_REQUIRED_BEFORE_RBAC' })
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
