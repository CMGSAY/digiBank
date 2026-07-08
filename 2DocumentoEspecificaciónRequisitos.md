---

# 2. Documento de Especificación de Requisitos (SRS) - DigiBank MVP
**Versión:** 2.0  
**Estándar de referencia:** IEEE 830  
**Última actualización:** 03/07/2026

---

## Glosario Técnico

| Término | Definición |
|---------|------------|
| **ACID** | Atomicidad, Consistencia, Aislamiento y Durabilidad — propiedades que garantizan la integridad de transacciones en bases de datos |
| **RBAC** | Role-Based Access Control. Control de acceso en el que los permisos se asignan a roles, no a usuarios individuales |
| **JWT** | JSON Web Token. Estándar de token firmado digitalmente para transportar claims de autenticación entre el cliente y el servidor |
| **OAuth2** | Protocolo de autorización que permite a una aplicación obtener acceso limitado a una cuenta de usuario en un servicio de terceros (ej. Google) |
| **2FN / 3FN** | Segunda y Tercera Forma Normal. Estándares de normalización relacional para eliminar redundancia e inconsistencias en bases de datos |
| **CSP** | Content Security Policy. Header HTTP que controla qué recursos puede cargar el navegador |
| **HSTS** | HTTP Strict Transport Security. Header que fuerza conexiones HTTPS |
| **CSRF** | Cross-Site Request Forgery. Ataque que engaña al navegador para que envíe peticiones no autorizadas en nombre del usuario |
| **Rate Limiting** | Técnica que limita la cantidad de peticiones que un cliente puede hacer a una API en un periodo de tiempo |
| **DPI** | Documento Personal de Identificación. Identificador único de ciudadano en Guatemala |
| **3FN** | Tercera Forma Normal. El esquema de base de datos no tiene dependencias transitivas; todo atributo no-clave depende únicamente de la clave primaria |

---

## I. Lista de Funcionalidades (Método MoSCoW)

### Must Have — Obligatorio para funcionar y aprobar

* Autenticación de usuarios integrada con Google (OAuth2) y formulario local (email + contraseña).
* Control de Acceso Basado en Roles (RBAC) con redirección dinámica para 4 roles: `ADMIN`, `TRABAJADOR_OPERACIONES`, `TRABAJADOR_SOPORTE`, `CLIENTE`.
* Dashboard del cliente con tarjetas de cuentas multimoneda (Quetzales, Dólares, Euros).
* Motor de transferencias atómicas (ACID) entre cuentas internas del mismo banco.
* Generador algorítmico de números de cuenta (10 dígitos: prefijo lógico + núcleo aleatorio + dígito verificador Luhn).
* Foro de interacción en tiempo real mediante WebSockets (Socket.io).
* Historial de transacciones paginado con código de colores (ingresos/egresos).
* Uso estricto de dos bases de datos: MySQL 3FN (transaccional) y MongoDB (mensajería/logs).
* Estrategia de despliegue multientorno: Vercel (Frontend) y Render/Railway (Backend).
* **Seguridad mínima obligatoria:** HTTPS/TLS, headers de seguridad, JWT con expiración, validación y sanitización de inputs en todos los endpoints.
* Logging de auditoría para todas las operaciones financieras (tabla `AUDIT_LOG` en MySQL).

### Should Have — Necesario para la experiencia completa

* Landing page pública con calculadora de préstamos y tabla de tipo de cambio en tiempo real.
* Módulo de Directorio de Beneficiarios (CRUD de cuentas frecuentes).
* Generador dinámico de Estados de Cuenta exportables a PDF (al momento y mensuales).
* Sistema de Máquina de Estados para la solicitud, revisión y aprobación de préstamos.
* Flujo de contraseña temporal con cambio obligatorio en el primer inicio de sesión.
* Protección CSRF en formularios de transferencia y solicitud de préstamo.

### Could Have — Si sobra tiempo

* Aprobación automática de créditos menores (< Q3,000) basada en validación matemática de ingresos.
* Notificaciones en tiempo real al cliente cuando un trabajador aprueba un préstamo.
* Dashboard de métricas del Administrador (transacciones por día, volumen total, usuarios activos).

### Won't Have — Fuera del alcance de esta versión

* Transferencias interbancarias externas (ACH o red SWIFT).
* Integración con tarjetas de crédito reales o pasarelas de pago (Stripe/PayPal).
* Aplicaciones móviles nativas iOS/Android.
* Autenticación de dos factores (2FA) vía SMS — se evalúa para v2.0.

---

## II. Historias de Usuario

### Rol: Cliente Final

1. **Como Cliente**, quiero iniciar sesión con mi cuenta de Google para acceder a mi banco de forma rápida y segura.
2. **Como Cliente**, quiero iniciar sesión con correo y contraseña como alternativa a Google.
3. **Como Cliente**, quiero ver el saldo de mis cuentas en tarjetas diferenciadas por moneda para conocer mi disponibilidad financiera.
4. **Como Cliente**, quiero convertir dinero entre mis cuentas de distintas divisas aplicando la tasa del banco.
5. **Como Cliente**, quiero guardar cuentas de terceros en un "Directorio" para no memorizar números al transferir.
6. **Como Cliente**, quiero transferir dinero a otros usuarios de DigiBank con un comentario de referencia.
7. **Como Cliente**, quiero llenar un formulario de solicitud de préstamo con mis datos de ingresos.
8. **Como Cliente**, quiero ver un historial cronológico de mis transacciones filtrable por fechas y tipo.
9. **Como Cliente**, quiero generar y descargar mi estado de cuenta en PDF para un rango de fechas personalizado.
10. **Como Cliente**, quiero participar en el Foro de interacción en tiempo real.
11. **Como Cliente**, quiero que si mi sesión expira, el sistema me redirija al login de forma segura sin perder datos.

### Rol: Trabajador de Soporte

12. **Como Trabajador de Soporte**, quiero buscar un cliente por número de cuenta o DPI para ver su perfil en modo lectura.
13. **Como Trabajador de Soporte**, quiero ver el historial completo de un cliente para ayudarle a rastrear cobros duplicados.
14. **Como Trabajador de Soporte**, quiero bloquear preventivamente la cuenta de un usuario en caso de fraude reportado.

### Rol: Trabajador de Operaciones

15. **Como Trabajador de Operaciones**, quiero ver la lista de préstamos en estado `PENDIENTE` ordenada por fecha de solicitud.
16. **Como Trabajador de Operaciones**, quiero ver el saldo promedio e ingresos declarados del solicitante para evaluar su capacidad de pago.
17. **Como Trabajador de Operaciones**, quiero aprobar o rechazar una solicitud con un comentario obligatorio de justificación.

### Rol: Administrador

18. **Como Administrador**, quiero crear nuevos usuarios de tipo `CLIENTE` o `TRABAJADOR` desde un formulario seguro.
19. **Como Administrador**, quiero que el sistema genere automáticamente un número de cuenta de 10 dígitos único al crear un cliente.
20. **Como Administrador**, quiero establecer manualmente el precio de compra y venta del dólar y euro para todos los usuarios del sistema.
21. **Como Administrador**, quiero ver un log de auditoría de todas las operaciones financieras realizadas en el sistema.

---

## III. Requisitos No Funcionales Críticos

### Rendimiento y Escalabilidad
* La SPA construida en React debe renderizar vistas en **menos de 2 segundos** en una conexión estándar de 10 Mbps.
* La API debe responder consultas de saldo y historial en **menos de 500 ms** bajo carga normal.
* El sistema debe soportar al menos **100 usuarios concurrentes** sin degradación perceptible de rendimiento.
* Las consultas de historial se devolverán paginadas (**máximo 20 registros por página**) para no saturar la red ni la base de datos.

### Diseño, Usabilidad y Accesibilidad (UX/UI & a11y)
* La interfaz debe ser **100% responsiva** (Mobile-First), probada en viewports de 320px, 768px y 1440px.
* El diseño debe replicar el patrón de tarjetas blancas con botones de colores sólidos descrito en los wireframes.
* Todos los formularios deben mostrar mensajes de error claros y localizados al español.
* Las operaciones destructivas o irreversibles (transferencias, bloqueos) deben requerir confirmación explícita del usuario mediante un modal de doble confirmación.
* **Accesibilidad (a11y) obligatoria:** La aplicación web debe alinearse con las pautas **WCAG 2.1 nivel AA**:
  * Uso estricto de HTML5 semántico (ej. `<main>`, `<nav>`, `<header>`, `<button>`).
  * Relación de contraste de colores mínima de 4.5:1 para elementos de texto e interfaz crítica.
  * Compatibilidad con lectores de pantalla (lectura lógica del DOM y atributos ARIA en componentes dinámicos como modales y alertas).
  * Soporte completo de navegación por teclado, incluyendo indicadores de foco (`:focus`) visibles y orden de tabulación lógico.

### SEO y Optimización Técnica (Página Pública)
* La Landing Page pública debe contar con una estructura SEO básica:
  * Etiquetas meta dinámicas en el encabezado (Title descriptivo, Meta Description optimizada).
  * Etiquetas Open Graph (`og:title`, `og:description`, `og:image`) para previsualización en redes sociales.
  * Jerarquía clara de encabezados (`h1` único por página, seguido de `h2` y `h3` lógicos).
  * Optimización de Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 para garantizar una carga veloz y respuesta interactiva ágil.
  * Creación de archivos `robots.txt` y `sitemap.xml` para indexación.

### Seguridad
* **HTTPS/TLS 1.3** obligatorio en producción. El servidor debe redirigir automáticamente cualquier petición HTTP a HTTPS.
* **Headers HTTP de seguridad** implementados con `helmet.js`:
  * `Content-Security-Policy` para prevenir XSS.
  * `Strict-Transport-Security` con duración mínima de 1 año.
  * `X-Frame-Options: DENY` para prevenir clickjacking.
  * `X-Content-Type-Options: nosniff`.
* **Manejo de Sesión mediante Cookies Seguras:** El token JWT **no** se almacenará en `localStorage` debido a riesgos de XSS. Se transportará y almacenará en una **Cookie segura**:
  * Atributos: `httpOnly` (no accesible por Javascript), `secure` (solo transmitida sobre HTTPS en producción, deshabilitada temporalmente en `localhost` HTTP para desarrollo local), y `SameSite=Strict` (mitigación CSRF).
* **Expiración de Sesión Corta:** El JWT tendrá un tiempo de expiración estricto de **15 minutos de inactividad** para evitar secuestros de sesión en equipos compartidos o desatendidos.
* **Protección CSRF activa:** Debido a que el navegador envía la cookie JWT automáticamente, se implementará protección CSRF para peticiones de mutación (transferencias, solicitud de préstamos, cambio de clave) utilizando el patrón *Double Submit Cookie* o validación cruzada de token CSRF.
* **Hash de contraseñas** exclusivamente con `bcryptjs` con factor de coste mínimo de 12.
* **Validación y sanitización** de todos los inputs del lado del servidor usando `express-validator`.
* **Rate Limiting** configurado por nivel:
  * Endpoints de autenticación: máximo **5 intentos por IP en 15 minutos**
  * API pública (tipo de cambio): máximo **60 peticiones por minuto por IP**
  * Endpoints transaccionales: máximo **10 peticiones por minuto por usuario autenticado**
* **Auditoría obligatoria:** Todo evento de seguridad (login fallido, acceso denegado 403, transferencia) debe registrarse en la tabla `AUDIT_LOG`.
* Las contraseñas temporales deben expirar en **24 horas**. Si no se cambian, el acceso debe bloquearse.

### Separación Física y Despliegue
* El frontend vivirá exclusivamente en un CDN (Vercel) y consumirá la API mediante peticiones HTTPS asíncronas y WebSockets seguros (WSS).
* Las variables de entorno sensibles (credenciales de BD, secretos JWT) nunca deben estar en el repositorio de código. Se gestionarán mediante los paneles de secretos de Vercel y Render.

### Aislamiento de Bases de Datos
* MySQL manejará exclusivamente la estructura relacional financiera en **Tercera Forma Normal (3FN)**: Usuarios, Roles, Cuentas, Monedas, Transacciones, Préstamos, Beneficiarios, Tasas de Cambio, Logs de Auditoría.
* MongoDB manejará únicamente las colecciones documentales: mensajes del Foro.

---

## IV. Reglas de Negocio

1. **Atomicidad Innegociable (ACID):** Toda transferencia de fondos se ejecuta como una transacción única. Si el abono a la cuenta destino falla, el débito de la cuenta origen se revierte con `ROLLBACK` instantáneamente.

2. **Validación de Fondos Restrictiva:** El sistema debe impedir cualquier transacción de débito si el monto supera el saldo disponible actual. El bloqueo ocurre en la capa de servicio, no solo en el frontend.

3. **Algoritmo de Cuentas Infalible:** Ningún número de cuenta puede asignarse sin verificar, mediante la restricción `UNIQUE` en MySQL y un bucle de reintento, que no existe previamente. Se usará el algoritmo de Luhn para calcular el dígito verificador del décimo dígito.

4. **Tasa de Cambio Obligatoria:**
   * **Cliente compra divisas (GTQ → USD/EUR):** Se aplica la tasa de `VENTA` configurada por el Administrador.
   * **Cliente vende divisas (USD/EUR → GTQ):** Se aplica la tasa de `COMPRA` configurada por el Administrador.

5. **Aislamiento de Roles por JWT:** Cualquier petición a un endpoint protegido que no tenga un JWT válido o cuyo `rol` no coincida con el requerido, recibirá un error `401 Unauthorized` o `403 Forbidden` sin excepción. El middleware de RBAC valida en el servidor, independientemente de lo que muestre el frontend.

6. **Desembolso Automático Atómico:** Cuando una solicitud de crédito cambia de `PENDIENTE` a `APROBADO`, el sistema ejecuta en la misma transacción SQL: (1) actualización del estado del préstamo, (2) inserción del registro en `TRANSACCIONES`, (3) actualización del saldo de la cuenta destino. Si cualquier paso falla, toda la operación se revierte.

7. **Contraseña Temporal Efímera:** Las contraseñas temporales tienen una caducidad de 24 horas desde su generación. Pasado ese plazo, el acceso queda bloqueado y el Administrador debe generar una nueva. Este dato se almacena en la tabla `USUARIOS` como `fecha_expiracion_password_temp`.

8. **Registro de Auditoría Obligatorio:** Toda operación financiera (transferencia, conversión, desembolso, bloqueo de cuenta) genera un registro inmutable en la tabla `AUDIT_LOG` que incluye: usuario ejecutor, IP de origen, timestamp, tipo de operación y resultado (éxito/fallo).

9. **Bloqueo de Cuenta:** Una cuenta en estado `BLOQUEADA` no puede ser debitada ni creditada. Los intentos de operar sobre ella deben retornar error `423 Locked` y generar una entrada en `AUDIT_LOG`.

10. **Transferencias entre distintas monedas a terceros:** Solo se permite entre cuentas de la misma moneda. Para transferir entre distintas monedas, el cliente primero debe usar el módulo de Conversión (entre sus propias cuentas) y luego transferir en la moneda destino.

---

## V. Estrategia de Testing

### Tipos de Prueba Requeridos

| Tipo | Herramienta | Cobertura Mínima | Qué se prueba |
|------|-------------|-----------------|---------------|
| **Unitario** | Jest | 80% de funciones en `/services` | Lógica de negocio: ACID, generador de cuentas, cálculo de tasas, algoritmo Luhn |
| **Integración** | Jest + Supertest | Todos los endpoints críticos | Flujo completo HTTP: autenticación, transferencias, RBAC |
| **End-to-End** | Cypress (opcional) | Flujos de usuario clave | Login → Transferencia → Historial |
| **Carga** | Artillery | Escenario de 100 usuarios | Estabilidad bajo carga concurrente |
| **Seguridad** | OWASP ZAP (manual) | Endpoints públicos y autenticados | OWASP Top 10: inyección, XSS, CSRF, exposición de datos |

### Casos de Prueba Críticos Obligatorios

**Transacciones ACID:**
- TC-01: Transferencia exitosa — saldo A disminuye y saldo B aumenta en el mismo monto.
- TC-02: Transferencia con fondos insuficientes — la operación es rechazada y ningún saldo cambia.
- TC-03: Fallo simulado del servidor a mitad de transacción — se verifica que el `ROLLBACK` revierte el estado inicial.

**Seguridad y RBAC:**
- TC-04: Un `CLIENTE` intentando acceder a `/api/admin/*` recibe `403 Forbidden`.
- TC-05: JWT expirado — el servidor rechaza la petición con `401 Unauthorized`.
- TC-06: 6 intentos de login fallidos desde la misma IP en 15 minutos — el 6to es bloqueado por rate limiting.
- TC-07: Input de SQL injection en el campo de monto — la petición es sanitizada y rechazada.

**Generador de Cuentas:**
- TC-08: Generación de 1,000 números de cuenta consecutivos — se verifica que no hay duplicados.
- TC-09: El dígito verificador del número de cuenta supera la validación de Luhn.
