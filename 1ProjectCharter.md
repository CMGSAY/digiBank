---

# 1. Project Charter: DigiBank MVP

### **Objetivo de Negocio**

Desarrollar un sistema web interactivo de banca en línea ficticio para pequeños bancos que permita la gestión multimoneda y transferencias, incluyendo un foro de interacción y un control estricto de accesos, sirviendo como entorno de validación de buenas prácticas de desarrollo e integración tecnológica.

---

### **Alcance de Alto Nivel**

* **QUÉ ENTRA (El MVP Definitivo):**
* **Sitio Web Informativo:** Página principal con calculadora de créditos interactiva y visualizador del tipo de cambio (gestionado manualmente por el Administrador).
* **Sistema de Autenticación Integrado:** Login unificado utilizando **Autenticación con Google** (OAuth2).
* **Control de Acceso Basado en Roles (RBAC):** Redirección dinámica y bloqueo de rutas para tres perfiles (Administrador, Trabajador/Asistencia, Cliente).
* **Dashboard Financiero del Cliente:** Visualización de cuentas en Quetzales, Dólares y Euros con números de cuenta de 10 dígitos generados bajo un algoritmo de validación de unicidad.
* **Módulo Transaccional:** Transferencias atómicas entre usuarios del mismo banco y conversión de divisas entre cuentas propias.
* **Gestión de Préstamos:** Formulario de solicitud para clientes (estado inicial `PENDIENTE`) y panel de aprobación/rechazo para el Trabajador.
* **Historial y Estados de Cuenta:** Tabla visual con movimientos y opción para generar/descargar estados de cuenta al momento en formato PDF.
* **Foro de Interacción Activo:** Espacio comunitario interactivo dentro de la plataforma utilizando WebSockets para mensajería instantánea.
* **Estrategia de Despliegue:** Configuración en `localhost` durante el desarrollo y despliegue final físico separado (Frontend en Vercel, Backend en Render o Railway).


* **QUÉ NO ENTRA:**
* Conexión real con el Banco de Guatemala o pasarelas de pago de tarjetas de crédito reales.
* Soporte para múltiples usuarios bajo cuentas corporativas (empresas).
* Aplicación móvil nativa (Android/iOS).



---

### **Hitos Principales (Roadmap Realista)**

Dado la complejidad de un sistema bancario seguro, el plan de desarrollo se estructura en **4 semanas** con margen de seguridad:

**Semana 1: Fundamentos y Seguridad (03/07 - 09/07/2026)**
* **Días 1-2:** Arquitectura base, configuración de entornos, bases de datos (MySQL 3FN + MongoDB)
* **Días 3-4:** Sistema de autenticación (OAuth2 + JWT), RBAC, middleware de seguridad
* **Días 5-7:** Testing de seguridad, implementación HTTPS/TLS, headers de seguridad, rate limiting

**Semana 2: Core Financiero (10/07 - 16/07/2026)**
* **Días 8-10:** Generador de cuentas, algoritmo de números únicos, transacciones ACID
* **Días 11-12:** Motor de transferencias internas, conversión de divisas
* **Días 13-14:** Testing de transacciones, pruebas de rollback, auditoría de logs

**Semana 3: Funcionalidades de Negocio (17/07 - 23/07/2026)**
* **Días 15-16:** Sistema de préstamos (máquina de estados), back-office trabajador
* **Días 17-18:** Historial de transacciones, generación de PDFs
* **Días 19-20:** Foro en tiempo real (Socket.io), panel de administrador
* **Día 21:** Testing de integración end-to-end

**Semana 4: Frontend, Testing y Despliegue (24/07 - 31/07/2026)**
* **Días 22-25:** Desarrollo frontend completo (React + Tailwind)
* **Días 26-27:** Testing de carga, pruebas de penetración, auditoría de seguridad
* **Días 28-29:** Preparación de despliegue, configuración CI/CD
* **Días 30-31:** Despliegue a producción (Vercel + Render), monitoreo post-deployment

---

### **Riesgos Principales y Mitigación**

1. **Riesgo 1: Desincronización o inconsistencia entre las dos bases de datos (SQL y NoSQL).**
   * *Mitigación:* MySQL (SQL) se usará estrictamente para el dinero y las cuentas (datos ACID). MongoDB (NoSQL) exclusivamente para el Foro y logs. Ninguna operación financiera crítica cruzará a MongoDB.

2. **Riesgo 2: Fallos en el despliegue de Vercel debido al uso de librerías de encriptación nativas.**
   * *Mitigación:* Se usará `bcryptjs` en lugar de `bcrypt` nativo, garantizando compilación en cualquier entorno en la nube sin romper el pipeline.

3. **Riesgo 3: Vulnerabilidades de seguridad en un sistema financiero.**
   * *Mitigación:* Implementar HTTPS/TLS desde el día 1, headers de seguridad (CSP, HSTS), validación estricta de inputs, protección CSRF en todas las mutaciones, y expiración de JWT configurada (máx. 8 horas de sesión activa).

4. **Riesgo 4: Ataques de inyección SQL o NoSQL.**
   * *Mitigación:* Uso obligatorio de consultas parametrizadas en `mysql2` y el ORM Mongoose para MongoDB. Sanitización de inputs con `express-validator` en todos los endpoints.

5. **Riesgo 5: Pérdida de datos por fallo transaccional.**
   * *Mitigación:* Toda operación financiera usará `START TRANSACTION / COMMIT / ROLLBACK` explícitos. Se implementará logging de auditoría en tabla separada para trazabilidad completa.

6. **Riesgo 6: Subestimación del tiempo de desarrollo.**
   * *Mitigación:* Cronograma expandido a 4 semanas con la estrategia de priorización MoSCoW. El MVP funcional se entrega al final de la semana 3; la semana 4 es exclusiva para QA y despliegue.



---

### **Stack Tecnológico Definitivo (Con Buenas Prácticas)**

* **Frontend (SPA Moderna):** React.js + Tailwind CSS, desplegado en **Vercel**.
* **Backend (Capa de Servicios):** Node.js con Express + **Socket.io** (para el Foro en tiempo real), desplegado en Render o Railway.
* **Base de Datos Principal (Transaccional/Relacional):** MySQL 8.x — esquema en **Tercera Forma Normal (3FN)** para datos financieros críticos (usuarios, cuentas, transacciones, préstamos).
* **Base de Datos Secundaria (No Relacional/Documental):** MongoDB (mensajes del Foro y logs de auditoría).
* **Seguridad:** `bcryptjs` (hash de contraseñas), `jsonwebtoken` (JWT con expiración configurada), `helmet` (headers HTTP seguros), `express-rate-limit` (rate limiting), `express-validator` (sanitización de inputs).
* **Testing:** Jest (unitario) + Supertest (integración de API) + Artillery (pruebas de carga).
* **CI/CD:** GitHub Actions para pipeline de lint → test → build → deploy automático.
* **Monitoreo:** Logging estructurado con `winston` + tabla de auditoría MySQL para operaciones financieras.

---
