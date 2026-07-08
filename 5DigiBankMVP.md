# DigiBank MVP 🏦

> Sistema bancario en línea interactivo y multientorno para la gestión de cuentas multimoneda, transferencias atómicas ACID, control de acceso por roles y comunicación en tiempo real.

---

## 📖 Documentación del Proyecto

| # | Documento | Descripción |
|---|-----------|-------------|
| 1 | `1ProjectCharter.md` | Contrato del proyecto: alcance, hitos, riesgos y stack |
| 2 | `2DocumentoEspecificaciónRequisitos.md` | SRS: MoSCoW, historias de usuario, NFRs, reglas de negocio, estrategia de testing |
| 3 | `3DocumentoDiseñoSistema.md` | DDS: arquitectura, esquema 3FN, contratos de API, diagramas de secuencia, seguridad |
| 4 | `4BacklogTécnico.md` | Plan de obra diario por semana con Definition of Done |

---

## 🏗️ Estructura del Proyecto

```text
digibank-mvp/
│
├── /docs                        # Documentos fundacionales
├── /database
│   ├── schema.sql               # DDL completo MySQL 8.x (Tercera Forma Normal)
│   └── mongo_setup.js           # Configuración de colecciones e índices MongoDB
│
├── /frontend                    # React 18 + Tailwind CSS
│   ├── /src
│   │   ├── /components          # Tarjetas de cuenta, modales, formularios
│   │   ├── /pages               # Landing, Login, Dashboard, Historial, Foro, Reportes
│   │   ├── /context             # AuthContext (estado global de sesión)
│   │   ├── /hooks               # useAuth, useTransfer, useForum
│   │   ├── /services            # axiosInstance con interceptores JWT
│   │   └── /utils               # formatCurrency, formatDate
│   ├── .env.local               # Variables de entorno para localhost
│   └── .env.production          # Variables para Vercel
│
└── /backend                     # Node.js + Express
    ├── /routes                  # Enrutamiento con middlewares aplicados
    ├── /controllers             # Capa HTTP (req → service → res)
    ├── /services                # Lógica de negocio (ACID, algoritmos, cálculos)
    ├── /models                  # Acceso a datos (mysql2 + Mongoose)
    ├── /middlewares             # auth, rbac, audit, rateLimiter
    ├── /config                  # Conexiones a MySQL y MongoDB
    ├── /utils                   # luhn.js, accountGenerator.js, logger.js
    ├── /tests                   # Jest + Supertest
    ├── .env                     # Variables locales (NUNCA commitear)
    └── server.js                # Entry point, Express + Socket.io
```

---

## 🚀 Instalación y Ejecución Local

### Requisitos previos
- Node.js 18+
- MySQL 8.x (local o servicio en la nube)
- MongoDB 6+ (local o MongoDB Atlas)

### 1. Clonar y configurar el backend

```bash
cd backend
npm install
```

Crear `/backend/.env` con:

```env
NODE_ENV=development
PORT=3000

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=tu_usuario
MYSQL_PASSWORD=tu_contraseña
MYSQL_DATABASE=digibank_mvp

# MongoDB
MONGODB_URI=mongodb://localhost:27017/digibank_foro

# JWT
JWT_SECRET=cambia_esto_por_un_secreto_de_64_chars_minimo
JWT_EXPIRES_IN=15m

# Google OAuth2
GOOGLE_CLIENT_ID=tu_google_client_id

# Frontend (para CORS)
FRONTEND_URL=http://localhost:5173
```

*Nota sobre cookies en Localhost:* Durante el desarrollo local en HTTP, asegúrate de que el backend configure el atributo de la cookie `jwt` con `secure: false`. El flag `secure: true` debe activarse automáticamente solo si `NODE_ENV=production` (producción con HTTPS).

Inicializar la base de datos:

```bash
mysql -u root -p < ../database/schema.sql
node ../database/mongo_setup.js
```

Arrancar el servidor:

```bash
npm run dev
# El servidor inicia en http://localhost:3000
```

### 2. Configurar y levantar el frontend

```bash
cd frontend
npm install
```

Crear `/frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
```

```bash
npm run dev
# La app abre en http://localhost:5173
```

---

## 🔐 Roles del Sistema

| Rol | Entorno | Acceso |
|-----|---------|--------|
| `ADMIN` | `/gerencia/dashboard` | Gestión total: usuarios, tasas, audit log |
| `TRABAJADOR_OPERACIONES` | `/operaciones/panel` | Revisar y aprobar/rechazar préstamos |
| `TRABAJADOR_SOPORTE` | `/soporte/panel` | Solo lectura de perfiles, bloqueo de cuentas |
| `CLIENTE` | `/banca/resumen` | Cuentas, transferencias, préstamos, foro |

---

## 🗄️ Base de Datos (Tercera Forma Normal — 3FN)

El esquema MySQL está diseñado en **3FN** para eliminar redundancias y garantizar integridad referencial:

| Tabla | Propósito |
|-------|-----------|
| `ROLES` | Catálogo de roles del sistema |
| `USUARIOS` | Datos de autenticación e identidad |
| `MONEDAS` | Catálogo de divisas (GTQ, USD, EUR) |
| `TASAS_CAMBIO` | Historial de tasas compra/venta con campo `activo` para la tasa vigente |
| `CUENTAS` | Cuentas bancarias con saldo y estado |
| `TRANSACCIONES` | Registro inmutable de movimientos ACID |
| `PRESTAMOS` | Ciclo de vida de solicitudes de crédito |
| `BENEFICIARIOS` | Directorio de cuentas frecuentes por usuario |
| `AUDIT_LOG` | Registro de seguridad inmutable |
| `SESIONES_REVOCADAS` | JWTs inválidados (logout, cambio de clave, bloqueo) |

MongoDB maneja únicamente `mensajes_foro` para el chat en tiempo real.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
cd backend && npm test

# Tests con cobertura
npm test -- --coverage

# Tests de carga (requiere Artillery instalado globalmente)
npx artillery run tests/load/carga_100_usuarios.yml
```

Casos de prueba críticos cubiertos:
- TC-01 a TC-09 del SRS (transacciones ACID, RBAC, rate limiting, generador Luhn)

---

## 🌍 Despliegue a Producción

El sistema está diseñado para despliegue separado (multientorno):

**Frontend → Vercel**
1. Conectar el repositorio en vercel.com
2. Configurar `VITE_API_URL` apuntando a la URL pública de Render

**Backend → Render**
1. Conectar el repositorio en render.com
2. Configurar todas las variables de entorno del `.env` en el panel de Render
3. Render detectará automáticamente el `package.json` y ejecutará `npm start`

**CI/CD automático:** Cada `git push` a `main` ejecuta el pipeline de GitHub Actions (lint → test → build) antes de desplegar.

---

## 🛡️ Seguridad y Calidad Implementada

- **HTTPS/TLS 1.3** en producción (forzado por Vercel y Render).
- **Headers seguros** con `helmet.js` (CSP, HSTS, X-Frame-Options).
- **JWT seguro en Cookies HttpOnly:** El token se guarda en una cookie `httpOnly`, `secure` (en producción), `SameSite=Strict` para evitar robo de sesión vía XSS.
- **Expiración Corta:** Expiración estricta de **15 minutos de inactividad** (`JWT_EXPIRES_IN=15m`).
- **Protección CSRF activa:** Patrón *Double Submit Cookie* para peticiones de escritura.
- **Revocación de tokens** mediante tabla `SESIONES_REVOCADAS` en MySQL (logout, cambio de contraseña, bloqueo de cuenta) — catalogado como deuda técnica para migrar a Redis en producción.
- **bcryptjs** con factor de coste 12 para hash de contraseñas.
- **Validación de contraseña** en cambio: mínimo 8 chars, mayúscula, número y símbolo.
- **Rate limiting** diferenciado por tipo de endpoint (auth: 5/15min, público: 60/min, transaccional: 10/min).
- **Validación de inputs** con `express-validator` en todos los endpoints.
- **Autenticación de WebSocket** leyendo el token JWT de las cookies en el handshake de Socket.io.
- **RBAC** validado en el servidor en cada petición, independiente de las rutas de frontend.
- **Audit log inmutable** para trazabilidad financiera completa de todas las operaciones.
- **Historial de tasas** preservado en `TASAS_CAMBIO` (campo `activo`) para auditoría de conversiones históricas.
- **Accesibilidad (a11y):** Interfaces web alineadas con las pautas **WCAG 2.1 AA** (HTML semántico, contraste, foco controlado, ARIA).
- **SEO Técnico:** Metadatos dinámicos y Core Web Vitals optimizados en la página principal pública.
