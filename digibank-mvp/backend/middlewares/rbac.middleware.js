// Middleware de Control de Acceso Basado en Roles (RBAC)

function exigirRoles(rolesPermitidos) {
  return (req, res, next) => {
    // 1. Asegurarse de que el usuario ya ha sido autenticado por el middleware de Firebase
    if (!req.user) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED_BEFORE_RBAC',
          message: 'Error de arquitectura: Se debe validar la autenticación antes del control de roles.'
        }
      });
    }

    // 2. Validar que el rol esté dentro de los permitidos para el endpoint
    const tienePermiso = rolesPermitidos.includes(req.user.rol);

    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ACCESS',
          message: `Acceso denegado. Tu nivel de acceso (${req.user.rol}) no es suficiente para este recurso.`
        }
      });
    }

    next();
  };
}

module.exports = { exigirRoles };
