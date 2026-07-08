# Plan de Trabajo Secuencial: DigiBank MVP

Este documento define la ruta lógica de implementación del proyecto. Ninguna fase puede comenzar si sus dependencias previas no se han completado e instalado con éxito.

---

## FASE 1: Configuración de Infraestructura y Entorno Local (Docker)
*Dependencias: Ninguna*

- [x] Crear el archivo `docker-compose.yml` en la raíz del proyecto para definir los contenedores: MySQL, MongoDB y Node.js.
- [x] Definir el archivo `.env` del backend con credenciales y puertos de desarrollo local para las bases de datos.
- [x] Configurar el archivo `Dockerfile` para la imagen del backend Express.
- [x] Crear el archivo `.env.local` en el frontend para apuntar a la dirección local del backend en Docker (`http://localhost:3000/api/v1`).
- [x] Validar que `docker compose up -d` inicie correctamente los servicios de MySQL y MongoDB sin errores de puertos.

---

## FASE 2: Diseño y Sincronización de Base de Datos
*Dependencias: Fase 1 Completada*

- [x] Validar y refinar la estructura lógica DDL en `database/digibank.sql` (MySQL).
- [x] Ejecutar el script `digibank.sql` dentro del contenedor de MySQL local para crear las tablas y llaves foráneas.
- [x] Validar la correcta creación de los índices primarios y secundarios en MySQL mediante la herramienta CLI de Docker.
- [x] Escribir el script de inicialización `database/mongo_setup.js` para la creación de índices y colecciones en MongoDB.
- [x] Ejecutar `mongo_setup.js` dentro del contenedor MongoDB local para verificar la colección `mensajes_foro`.

---

## FASE 3: Estructura Base del Backend (Node.js + Express)
*Dependencias: Fase 2 Completada*

- [x] Crear el archivo `package.json` del backend e instalar las dependencias básicas (`express`, `cors`, `dotenv`, `mysql2`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`).
- [x] Inicializar la configuración de Firebase Admin SDK en `backend/config/firebase.config.js`.
- [x] Crear el middleware de validación del token de Firebase Auth en `backend/middlewares/auth.middleware.js`.
- [x] Configurar el script de arranque del servidor en `backend/server.js` conectando Express, Socket.io, MySQL y MongoDB.
- [x] Verificar con Postman o curl que el backend levante en `http://localhost:3000` y responda un estado de salud básico.

---

## FASE 4: Capa de Negocio y Lógica del Backend (N-Capas)
*Dependencias: Fase 3 Completada*

- [x] Escribir el modelo y consultas de usuarios en `backend/models` con mysql2.
- [x] Escribir la lógica del servicio de autenticación (`auth.service.js`) integrando Firebase Auth y mapeo de perfiles locales.
- [x] Codificar el middleware de RBAC (`rbac.middleware.js`) para restringir rutas financieras exclusivas para clientes y administradores.
- [x] Implementar el servicio transaccional ACID (`transaccion.service.js`) para transferencias y conversiones utilizando transacciones relacionales explícitas y bloqueo de filas.
- [x] Codificar los controladores y rutas transaccionales en `backend/controllers/transaccion.controller.js` y `backend/routes/transaccion.routes.js`.
- [x] Codificar el middleware de auditoría (`audit.middleware.js`) para guardar logs asíncronos en la tabla relacional.
- [x] Programar el controlador y servicio del foro para interactuar con MongoDB e integrar eventos de Socket.io.

---

## FASE 5: Boilerplate e Integración del Frontend (React + Tailwind)
*Dependencias: Fase 4 Completada*

- [x] Inicializar el frontend de React 18 con Vite y configurar Tailwind CSS.
- [x] Configurar Firebase SDK local en el frontend e implementar `AuthContext.jsx` para el manejo del estado global de sesión del cliente.
- [x] Crear la instancia centralizada de Axios en `frontend/src/services/axiosInstance.js` con el interceptor de peticiones para inyectar el JWT de Firebase.
- [x] Implementar las vistas públicas: Landing Page y Login con redirección automática según rol obtenido tras iniciar sesión con Google.

---

## FASE 6: Páginas Funcionales del Cliente (Banca & Foro)
*Dependencias: Fase 5 Completada*

- [x] Rediseñar e implementar la página de Dashboard (`Dashboard.jsx`) mostrando saldos y tarjetas resumen del cliente (Estilo Corporativo Claro).
- [x] Desarrollar la página de Historial (`Historial.jsx`) conectando con el servicio paginado del backend (Estilo Corporativo Claro).
- [x] Diseñar el formulario de transferencia monetaria interna y la conversión de divisas con confirmación en modal.
- [x] Desarrollar la página del Foro de interacción conectando Socket.io client para envío y recepción en tiempo real (Estilo Corporativo Claro).

---

## FASE 7: Pruebas unitarias e Integración Continua (Jest)
*Dependencias: Fase 6 Completada*

- [x] Configurar Jest y Supertest en el backend para realizar pruebas de endpoints.
- [x] Escribir pruebas unitarias del servicio de transacciones (`transaccion.service.test.js`) simulando escenarios de sobregiro y de éxito ACID.
- [x] Escribir pruebas de validación del middleware de autenticación y de control de roles (RBAC).
- [x] Ejecutar la suite completa de pruebas en local y resolver lints u otros errores de compilación.

---

## FASE 8: Rediseño Corporativo, Modularización y Completación de Vistas Vacías
*Dependencias: Fases 5, 6 y 7*

- [x] Llenar de código funcional los archivos de servicios vacíos (`frontend/src/services/cuenta.service.js`, `transaccion.service.js`, `auth.service.js`) para desacoplar lógica.
- [x] Crear los componentes reutilizables corporativos en los archivos vacíos (`frontend/src/components/Navbar.jsx`, `Sidebar.jsx`).
- [x] Reconectar el Login corporativo con `AuthContext.jsx` para recuperar la sesión localmente y evitar bloqueos de ruta.
- [x] Codificar las vistas de cliente vacías para habilitar el funcionamiento de todos los botones de navegación:
  - [x] `Prestamos.jsx` (Cotizador interactivo y listado).
  - [x] `Beneficiarios.jsx` (Registro de alias y cuentas de terceros).

