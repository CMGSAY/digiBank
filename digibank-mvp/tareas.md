# Plan de Trabajo - DigiBank MVP

> [!IMPORTANT]
> Cuando una tarea sea completada, debe marcarse con un check (`- [x]`). 
> **No se debe avanzar a una nueva tarea sin haber completado y verificado la anterior.**

## Checklist de Integración y Desarrollo

### Fase 1: Arquitectura e Infraestructura Local
- [x] Levantar y verificar los servicios de Docker (MySQL en puerto `3307` y MongoDB en puerto `27018`).
- [x] Ejecutar la migración SQL (`migration_prestamos.js`) para extender la tabla `PRESTAMOS` con columnas transaccionales.
- [x] Establecer y verificar la conexión a MongoDB desde el archivo de configuración del servidor (`backend/config/db.config.js` o similar).

### Fase 2: Desarrollo del Módulo de Presupuestos (MongoDB)
- [x] Diseñar el modelo Schema en Mongoose para la colección `presupuestos` (`backend/models/presupuesto.model.js`).
- [x] Crear el controlador de presupuestos (`backend/controllers/presupuesto.controller.js`):
  - [x] Obtener gastos agrupados por categoría cruzando transacciones de egreso del mes actual.
  - [x] Guardar/Actualizar límites personalizados por categoría.
- [x] Configurar las rutas HTTP en Express (`backend/routes/presupuesto.routes.js`) para el módulo de presupuestos.
- [x] Registrar las rutas en el enrutador principal del servidor Express (`backend/server.js`).

### Fase 3: Conexión y Refactorización del Frontend (React)
- [x] Crear el servicio de consumo de presupuesto (`frontend/src/services/presupuesto.service.js`) para enlazar las llamadas a la API Express.
- [x] Refactorizar el componente `FinanzasPersonales.jsx` para sustituir los datos estáticos por datos reales consumidos del servidor:
  - [x] Cargar límites del usuario desde MongoDB.
  - [x] Cargar gastos reales del mes agrupados por categoría.
  - [x] Habilitar la edición en la pestaña "Personalizar" para guardar en la BD.

### Fase 4: Auditoría y Seguridad
- [x] Diseñar e implementar el Schema Mongoose para `audit_logs` en MongoDB.
- [x] Crear un middleware en el backend para interceptar operaciones críticas (transferencias, desembolsos) y persistir logs de auditoría sin bloquear el flujo principal.
- [x] Validar la seguridad contra inyecciones SQL en todos los modelos MySQL usando sentencias preparadas (`pool.execute`).

### Fase 5: Pruebas Locales e Integración Final
- [x] Ejecutar compilación de producción del frontend (`npm run build`) para verificar consistencia.
- [x] Validar flujos completos locales (Solicitud -> Aprobación -> Gasto -> Presupuesto -> Auditoría).
