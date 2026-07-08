---

# 4. Backlog Técnico: TAREAS.md (DigiBank MVP)
**Versión:** 2.0 | **Duración estimada:** 4 semanas | **Última actualización:** 03/07/2026

---

## Estructura de Carpetas (Arquitectura N-Capas)

```text
digibank-mvp/
│
├── /docs                        # Documentos fundacionales
├── /database
│   ├── schema.sql               # DDL completo MySQL (3FN)
│   └── mongo_setup.js           # Índices MongoDB
│
├── /frontend                    # React.js + Tailwind CSS
│   ├── /src
│   │   ├── /components          # Componentes reutilizables (Tarjetas, Modales, Forms)
│   │   ├── /pages               # Vistas (Landing, Login, Dashboard, Foro, Reportes)
│   │   ├── /context             # AuthContext, NotifContext (estado global)
│   │   ├── /hooks               # Hooks personalizados (useAuth, useTransfer)
│   │   ├── /services            # Llamadas a la API (Axios con interceptores JWT)
│   │   └── /utils               # Helpers (formatCurrency, formatDate)
│   ├── .env.local               # VITE_API_URL para localhost (Vite usa prefijo VITE_, no REACT_APP_)
│   └── .env.production          # VITE_API_URL para Render
│
└── /backend                     # Node.js + Express
    ├── /routes                  # Definición de rutas y aplicación de middlewares
    ├── /controllers             # Capa HTTP (reciben req, llaman services, retornan res)
    ├── /services                # Lógica de negocio (ACID, algoritmos, validaciones)
    ├── /models                  # Acceso a datos (queries MySQL y Mongoose)
    ├── /middlewares             # auth.middleware.js, rbac.middleware.js, audit.middleware.js
    ├── /config                  # db.config.js (MySQL pool + Mongoose)
    ├── /utils                   # luhn.js, accountGenerator.js, logger.js
    ├── /tests                   # Pruebas unitarias e integración (Jest + Supertest)
    ├── .env                     # Variables locales (NUNCA en Git)
    └── server.js                # Entry point + Socket.io init
```

**Definition of Done (DoD) — válido para todas las tareas:**
- [ ] El código pasa el linter sin errores (`eslint`)
- [ ] Las pruebas unitarias asociadas existen y pasan (`npm test`)
- [ ] El endpoint fue probado manualmente con Postman/Thunder Client
- [ ] No hay credenciales ni secretos en el código fuente
- [ ] (Para Frontend) La interfaz cumple con los criterios de accesibilidad WCAG 2.1 AA (HTML semántico, foco visible, contraste mínimo de colores de 4.5:1, compatibilidad con lector de pantalla).

---

## SEMANA 1: Fundamentos, Seguridad y Base de Datos (Días 1-7)

### Día 1: Configuración del Repositorio y Estructura N-Capas

- [ ] Crear repositorio Git con `.gitignore` que excluya `.env`, `node_modules` y archivos de claves
- [ ] Crear la estructura de carpetas completa del proyecto (frontend + backend + database)
- [ ] Inicializar `package.json` en `/backend` con las dependencias base:
  `express`, `cookie-parser`, `mysql2`, `mongoose`, `dotenv`, `cors`, `helmet`, `express-rate-limit`, `express-validator`, `bcryptjs`, `jsonwebtoken`, `winston`, `socket.io`, `uuid` (para generar el claim `jti`)
- [ ] Crear `/backend/server.js` con Express configurado (sin rutas todavía)
- [ ] Configurar `winston` en `/backend/utils/logger.js` para logs estructurados en JSON

### Día 2: Base de Datos MySQL en 3FN

- [ ] Ejecutar el script `/database/schema.sql` completo en MySQL local (incluye `SESIONES_REVOCADAS`)
- [ ] Verificar que todas las FK, índices y constraints estén activos
- [ ] Insertar datos semilla: roles, monedas, tasas de cambio iniciales (activo=TRUE, Q7.77 venta USD, Q8.45 venta EUR)
- [ ] Crear usuario ADMIN inicial con contraseña hasheada con `bcryptjs` (factor 12)
- [ ] Crear `/backend/config/db.config.js` con el pool de conexiones MySQL (`mysql2/promise`)
- [ ] Crear `/backend/config/mongo.config.js` con la conexión Mongoose y los índices del foro
- [ ] Probar que ambas conexiones de BD se establecen correctamente al arrancar el servidor

### Día 3: Seguridad Base y Middlewares

- [ ] Configurar `helmet.js` con CSP, HSTS, X-Frame-Options, noSniff en `server.js`
- [ ] Configurar tres niveles de `express-rate-limit`: auth (5/15min), público (60/min), transaccional (10/min)
- [ ] Configurar CORS para aceptar el dominio del frontend (`FRONTEND_URL` de `.env`) habilitando `credentials: true`
- [ ] Crear `/backend/middlewares/auth.middleware.js` — verifica JWT extraído de las cookies (`req.cookies.jwt`), inyecta `req.user`
- [ ] Crear `/backend/middlewares/rbac.middleware.js` — valida que `req.user.rol` tenga el permiso requerido
- [ ] Crear `/backend/middlewares/audit.middleware.js` — registra en `AUDIT_LOG` todas las peticiones a rutas protegidas
- [ ] Escribir pruebas unitarias para los tres middlewares (TC-04, TC-05, TC-06 del SRS)

### Día 4: Autenticación Local (Login + Logout + Cambio de Contraseña)

- [ ] Instalar e importar `cookie-parser` en `server.js` para habilitar el parseo de cookies.
- [ ] Crear `/backend/models/usuarioModel.js` con queries parametrizadas para CRUD de USUARIOS (dividiendo `nombre_completo` en `nombres` y `apellidos`).
- [ ] Crear `/backend/services/authService.js`:
  - `loginLocal(email, password)`: busca usuario, verifica hash, genera JWT de corta duración (15 minutos) con `{ id_usuario, rol, jti: uuid() }`
  - `logout(res, jti, id_usuario, expira_en)`: limpia la cookie `jwt` e inserta el token en `SESIONES_REVOCADAS`
  - `cambiarPassword(res, id_usuario, nuevaPassword, jtiActual, expiraEn)`: hashea contraseña, actualiza BD, limpia cookie y revoca el JWT actual (fuerza re-login)
- [ ] Crear `/backend/controllers/authController.js` con manejo de errores HTTP correcto, estableciendo la cookie `jwt` (`httpOnly`, `secure`, `SameSite=Strict`, `maxAge=900000`) en el login/cambio y borrándola en el logout.
  - *Nota sobre desarrollo:* Deshabilitar flag `secure` (modo desarrollo: `secure: false`) cuando se trabaja sobre HTTP en `localhost`.
- [ ] Crear `/backend/routes/auth.routes.js` con el limiter de autenticación aplicado
- [ ] Actualizar el `auth.middleware.js` para verificar `SESIONES_REVOCADAS` antes de validar el JWT
- [ ] Agregar cron job semanal: `DELETE FROM SESIONES_REVOCADAS WHERE expira_en < NOW()` (limpieza de tokens vencidos)
- [ ] Probar manualmente: login, logout (cookie limpia y rechazada), cambio de contraseña

### Día 5: Autenticación con Google (OAuth2)

- [ ] Instalar y configurar `google-auth-library` en el backend
- [ ] Implementar `loginGoogle(google_token)` en `authService.js`:
  - Verifica el ID Token con la librería de Google
  - Si el `google_id` no existe en USUARIOS, crea el registro automáticamente (dividiendo el nombre que retorna Google en `nombres` y `apellidos`).
  - Establece la cookie `jwt` en la respuesta HTTP con el JWT generado con validez de 15 minutos.
- [ ] Actualizar `authController.js` y agregar el endpoint `POST /api/v1/auth/google`
- [ ] Escribir prueba de integración para el flujo de Google OAuth (TC-01 del SRS)

### Día 6: Flujo de Contraseña Temporal

- [ ] Modificar `POST /api/v1/admin/usuarios` para generar contraseña temporal (`DigiBank-XXXX`) hasheada
- [ ] Guardar `fecha_expiracion_pass_temp = NOW() + 24h` en USUARIOS
- [ ] En el middleware de auth, verificar si `debe_cambiar_password = true` → retornar flag en el JWT payload
- [ ] El frontend leerá ese flag y encerrará al usuario en `/cambiar-password` antes de mostrar el dashboard
- [ ] Agregar validación: si `fecha_expiracion_pass_temp < NOW()`, bloquear el acceso y devolver `423 Locked`

### Día 7: Buffer de Testing y Revisión de Seguridad

- [ ] Ejecutar suite de pruebas completa de la Semana 1 (`npm test`)
- [ ] Revisar que ningún endpoint devuelva stack traces en producción (configurar `NODE_ENV=production`)
- [ ] Verificar con Postman que todos los endpoints protegidos devuelven `401` sin JWT y `403` con rol incorrecto
- [ ] Documentar en el README los pasos para levantar el entorno local

---

## SEMANA 2: Core Financiero ACID (Días 8-14)

### Día 8: Generador de Cuentas y Modelo de Cuentas

- [ ] Implementar `calcularLuhn(numero)` en `/backend/utils/luhn.js` con prueba unitaria
- [ ] Implementar `generarNumeroCuenta(prefijoBanco)` en `/backend/utils/accountGenerator.js`:
  - Genera 9 dígitos + 1 verificador Luhn
  - Bucle de reintento con verificación `UNIQUE` contra MySQL (máx 100 intentos)
- [ ] Crear `/backend/models/cuentaModel.js` con queries para: obtener cuentas por usuario, obtener saldo con `FOR UPDATE`
- [ ] Escribir prueba unitaria TC-08 y TC-09 del SRS (1,000 cuentas sin duplicados + validación Luhn)

### Día 9: Endpoint de Mis Cuentas y Tasas de Cambio

- [ ] Crear `/backend/services/cuentaService.js` con `getMisCuentas(id_usuario)`
- [ ] Crear `GET /api/v1/cuentas/mis-cuentas` protegido para rol CLIENTE
- [ ] Crear `/backend/models/tasaModel.js` con queries para obtener y actualizar tasas
- [ ] Crear `GET /api/v1/tasas-cambio` público con rate limiter de 60/min
- [ ] Crear `PUT /api/v1/admin/tasas-cambio` protegido para ADMIN con validación de campos

### Día 10: Motor de Transferencias ACID

- [ ] Crear `/backend/services/transactionService.js`
- [ ] Implementar `ejecutarTransferencia(id_cuenta_origen, numero_cuenta_destino, monto, descripcion, id_usuario)`:
  ```
  START TRANSACTION
  → SELECT saldo FOR UPDATE (bloqueo optimista)
  → Validar fondos suficientes
  → UPDATE saldo origen (restar)
  → UPDATE saldo destino (sumar)
  → INSERT TRANSACCIONES
  → INSERT AUDIT_LOG
  COMMIT (o ROLLBACK si cualquier paso falla)
  ```
- [ ] Escribir pruebas TC-01, TC-02 y TC-03 del SRS

### Día 11: Motor de Conversión de Divisas

- [ ] Implementar `ejecutarConversion(id_cuenta_origen, id_cuenta_destino, monto_origen, id_usuario)` en `transactionService.js`:
  - Determina si es operación de COMPRA o VENTA según las monedas
  - Consulta la tasa vigente de `TASAS_CAMBIO`
  - Calcula el `monto_destino` con la fórmula correcta
  - Ejecuta en la misma lógica ACID que las transferencias
- [ ] Crear los endpoints `POST /api/v1/transacciones/transferencia` y `POST /api/v1/transacciones/conversion`
- [ ] Prueba de integración: convertir GTQ→USD y verificar montos con la tasa activa

### Día 12: Historial de Transacciones

- [ ] Crear `getHistorial(id_cuenta, filtros)` en `transactionService.js` con soporte de paginación
- [ ] La query debe incluir `saldo_resultante` pre-calculado y ordenar por `fecha DESC`
- [ ] Crear `GET /api/v1/transacciones/historial` con validación de query params
- [ ] Verificar que un CLIENTE solo pueda ver el historial de sus propias cuentas (validar FK en el servicio)

### Días 13-14: Testing del Core Financiero

- [ ] Ejecutar suite completa de tests del core financiero
- [ ] Probar escenario de fallo simulado: comentar el UPDATE del destino y verificar ROLLBACK
- [ ] Probar concurrencia básica: enviar dos transferencias simultáneas que en total excedan el saldo
- [ ] Verificar que todos los eventos se registran en AUDIT_LOG correctamente

---

## SEMANA 3: Funcionalidades de Negocio y Foro (Días 15-21)

### Día 15: Sistema de Préstamos (Máquina de Estados)

- [ ] Crear `/backend/services/prestamoService.js`
- [ ] Implementar `solicitarPrestamo(id_usuario, id_cuenta, monto, ingresos)` — crea registro en estado `PENDIENTE`
- [ ] Implementar `resolverPrestamo(id_prestamo, decision, comentario, id_trabajador)`:
  - Si `APROBADO`: ejecuta desembolso ACID (`START TRANSACTION → INSERT TRANSACCIONES → UPDATE CUENTAS → UPDATE PRESTAMOS → COMMIT`)
  - Si `RECHAZADO`: solo actualiza estado y comentario
- [ ] Crear los tres endpoints del ciclo de vida del préstamo
- [ ] Escribir prueba: aprobación → saldo de la cuenta aumenta exactamente en el monto aprobado

### Día 16: Back-Office del Trabajador y Soporte

- [ ] Crear `GET /api/v1/trabajador/prestamos` con datos enriquecidos (nombre, ratio deuda/ingreso, saldo promedio)
- [ ] Crear `GET /api/v1/soporte/clientes/:numero_cuenta` — búsqueda de perfil en modo solo-lectura (rol TRABAJADOR_SOPORTE)
- [ ] Crear `POST /api/v1/soporte/cuentas/:id_cuenta/bloquear` — cambia estado a `BLOQUEADA` y registra en AUDIT_LOG
- [ ] Verificar que un TRABAJADOR_SOPORTE no puede acceder a los endpoints de TRABAJADOR_OPERACIONES (TC-04)

### Día 17: Directorio de Beneficiarios

- [ ] Crear CRUD completo en `/backend/services/beneficiarioService.js`
- [ ] `agregarBeneficiario`: verifica que la cuenta destino existe y pertenece al banco, guarda con alias
- [ ] Crear endpoints: `GET`, `POST`, `DELETE /api/v1/beneficiarios`
- [ ] Crear `/backend/models/beneficiarioModel.js` con queries para listar y eliminar por propietario

### Día 18: Generación de PDFs (Estados de Cuenta)

- [ ] Instalar `pdfkit` en el backend
- [ ] Crear `/backend/services/reporteService.js` con `generarEstadoCuenta(id_cuenta, fecha_inicio, fecha_fin)`:
  - Encabezado: Logo DigiBank, datos del cliente, número de cuenta y periodo
  - Resumen: Saldo Anterior, Total Ingresos (+), Total Egresos (-), Saldo Final
  - Detalle: Tabla de movimientos con fecha, descripción, tipo y monto
- [ ] Crear `GET /api/v1/reportes/estado-cuenta` que devuelva el PDF como stream de bytes
- [ ] Probar descarga del PDF en Chrome y verificar que los números son correctos

### Días 19-20: Foro en Tiempo Real (Socket.io + MongoDB)

- [ ] Configurar el servidor Socket.io en `server.js` con CORS para el dominio del frontend (habilitando `credentials: true`)
- [ ] **Autenticación del WebSocket:** En el evento `connection`, leer el token JWT desde las cookies de la petición HTTP (o desde `socket.handshake.headers.cookie` usando un parseador de cookies manual/middleware):
  ```javascript
  io.use((socket, next) => {
    // Extraer cookie jwt
    const cookieHeader = socket.handshake.headers.cookie;
    const token = parseCookie(cookieHeader)?.jwt;
    if (!token) return next(new Error('AUTH_REQUIRED'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;  // disponible en todos los eventos del socket
      next();
    } catch (err) {
      next(new Error('TOKEN_INVALID'));
    }
  });
  ```
- [ ] Implementar eventos:
  - `join_forum` — el usuario se une a la sala pública (ya autenticado por el middleware)
  - `send_message` — valida que `mensaje.length <= 1000`, guarda en MongoDB y hace broadcast
  - `load_history` — devuelve los últimos 50 mensajes al conectarse (paginable)
- [ ] Crear `/backend/models/mensajeModel.js` con el schema de Mongoose y los índices
- [ ] El frontend se conectará enviando automáticamente la cookie de sesión: `io(URL, { withCredentials: true })`
- [ ] Probar con dos ventanas del navegador que los mensajes llegan en tiempo real

### Día 21: Panel de Administrador y Testing de Integración

- [ ] Crear endpoint `GET /api/v1/admin/audit-log` con filtros por usuario, acción y rango de fechas (paginado)
- [ ] Ejecutar suite completa de pruebas end-to-end del backend
- [ ] Probar flujo completo: crear usuario ADMIN → crear cliente → cliente inicia sesión → transfiere → trabajador aprueba préstamo

---

## SEMANA 4: Frontend, QA y Despliegue (Días 22-31)

### Días 22-23: Setup Frontend y Autenticación

- [ ] Inicializar proyecto React 18 en `/frontend` con Vite (`npm create vite@latest`)
- [ ] Instalar y configurar: `tailwindcss`, `react-router-dom v6`, `axios`, `socket.io-client`
- [ ] Configurar `axiosInstance` con `withCredentials: true` para habilitar el transporte automático de cookies HTTP.
- [ ] Crear `AuthContext.jsx` para gestión de sesión en el cliente. Al cargar la app, se realiza un check de sesión (`GET /auth/me`) para recuperar el usuario logueado en base a la cookie.
- [ ] Maquetar la pantalla de Login (formulario local + botón Google) con Tailwind, asegurando compatibilidad de contraste y navegación básica por teclado (WCAG 2.1 AA).

### Días 24-25: Dashboard del Cliente y Accesibilidad (a11y)

- [ ] Maquetar el componente `AccountCard.jsx` — tarjeta por cuenta con moneda, saldo, estado y etiquetas semánticas y de foco de accesibilidad.
- [ ] Maquetar el Dashboard principal con el Top Bar (tipo de cambio del día + navegación principal).
- [ ] Implementar modal de Transferencia: selector de cuenta origen, campo de cuenta destino, monto, descripción + confirmación (doble confirmación modal y foco de teclado controlado).
- [ ] Implementar modal de Conversión: selector de cuenta origen y destino con preview del monto convertido.
- [ ] Conectar todos los componentes a los endpoints del backend via Axios (usando cookies seguras).

### Días 26-27: Historial, Reportes, Préstamos y SEO

- [ ] Implementar metadatos dinámicos, SEO y tags Open Graph en el frontend para el Landing Page público.
- [ ] Maquetar la vista de Historial con tabla paginada, filtros de fecha, código de colores legibles y relaciones de contraste contrastadas (> 4.5:1).
- [ ] Implementar descarga de PDF: llamar al endpoint y disparar el download con `URL.createObjectURL`
- [ ] Maquetar la vista de Préstamos con el formulario de solicitud y el estado actual del trámite.
- [ ] Maquetar las vistas de Back-Office: tabla de préstamos PENDIENTE con botones Aprobar/Rechazar.
- [ ] Maquetar el panel del Administrador: formulario crear usuario (campos separados para nombres y apellidos) + widget de tasas de cambio.

### Día 28: Foro en Tiempo Real (Frontend)

- [ ] **NOTA DE RIESGO:** En caso de retraso en el cronograma, priorizar el Core Financiero (Transferencias y Préstamos). El Foro es opcional y secundario en el MVP.
- [ ] Crear componente `Forum.jsx` que se conecta al WebSocket usando la conexión de cookies de sesión (`io(URL, { withCredentials: true })`).
- [ ] Implementar la lista de mensajes con auto-scroll al último mensaje y lectura semántica.
- [ ] Implementar el campo de texto y botón de envío con validación (max 1000 chars) y sanitización del lado del cliente.
- [ ] Maquetar el avatar del usuario y el timestamp de cada mensaje.

### Días 29-30: QA, Testing de Carga y Seguridad

- [ ] Ejecutar suite completa de Jest + Supertest (`npm test`)
- [ ] Instalar Artillery y ejecutar escenario de carga: 100 usuarios virtuales por 60 segundos
- [ ] Verificar tiempos de respuesta < 500ms bajo carga (requisito SRS)
- [ ] Revisar manualmente los 10 puntos del OWASP Top 10:
  - [ ] A01: Broken Access Control → probar acceso entre roles
  - [ ] A03: Injection → probar SQL injection en campos numéricos
  - [ ] A05: Security Misconfiguration → verificar headers con `curl -I`
  - [ ] A07: Auth Failures → probar JWT expirado y manipulado
- [ ] Corregir todos los problemas encontrados

### Día 31: Configuración CI/CD y Despliegue

- [ ] Crear `.github/workflows/ci.yml` con pipeline: `lint → test → build`
- [ ] Configurar variables de entorno en los paneles de Vercel (frontend) y Render (backend):
  - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
  - `MONGODB_URI`
  - `JWT_SECRET` (mínimo 64 caracteres aleatorios)
  - `GOOGLE_CLIENT_ID`
  - `FRONTEND_URL` (dominio de Vercel)
- [ ] Conectar el repositorio de GitHub a Vercel para el frontend
- [ ] Conectar el repositorio de GitHub a Render para el backend
- [ ] Ejecutar las migraciones SQL en la base de datos de producción
- [ ] Verificar que el despliegue funciona end-to-end con un smoke test manual
- [ ] Monitorear los logs de Render/Vercel durante los primeros 30 minutos en producción
