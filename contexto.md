# Contexto del Proyecto: DigiBank MVP

## 1. Perfiles y Roles Técnicos Requeridos
Para el desarrollo de DigiBank MVP se definen los siguientes roles de ingeniería senior:
* **Arquitecto de Software:** Responsable de definir la estructura en N-capas, asegurar el cumplimiento del flujo lógico (Rutas -> Middlewares -> Controladores -> Servicios -> Modelos), garantizar la desacoplación del frontend/backend, y estructurar el contenedor local multibases de datos con Docker Compose.
* **Administrador de Base de Datos MySQL (DBA Relacional):** Responsable de diseñar el modelo relacional transaccional en Tercera Forma Normal (3NF), garantizar la consistencia ACID, definir llaves primarias/foráneas, y configurar índices optimizados para mitigar bloqueos durante transferencias.
* **Administrador de Base de Datos MongoDB (DBA NoSQL):** Responsable de diseñar la estructura de colecciones y documentos para el foro colaborativo, definir índices de concurrencia e incorporar mecanismos que aseguren consultas ultrarrápidas de mensajes recientes.

---

## 2. Contexto del Proyecto
**DigiBank MVP** es una plataforma de banca en línea multimoneda (GTQ, USD, EUR) y multientorno. 
* **Desarrollo:** Entorno 100% local e independiente mediante Docker y Docker Compose para simular la red interna del sistema financiero.
* **Producción (Futuro):** Preparado arquitectónicamente para despliegues desacoplados en la nube: Frontend en Vercel, Backend en Render, MySQL en Railway, MongoDB en Atlas y Autenticación en Firebase.

---

## 3. Objetivos Principales del Desarrollo
1. **Consistencia Transaccional (ACID):** Garantizar que ninguna transferencia o conversión de divisas altere los saldos bancarios de forma incorrecta (cero pérdida de datos).
2. **Seguridad y Auditoría:** Autenticación robusta basada en Firebase (Google OAuth) + JWT de sesión de corta duración, y registro de logs inmutables para todas las actividades del usuario.
3. **Escalabilidad del Foro:** Implementar una sección interactiva para clientes capaz de soportar alta concurrencia utilizando bases de datos documentales.
4. **Pruebas Automatizadas:** Asegurar una cobertura de pruebas unitarias robusta a través de Jest + Supertest para las capas lógicas y endpoints críticos del servidor.

---

## 4. Restricciones Tecnológicas Estrictas
* **Frontend:** React 18 con Tailwind CSS. Sesión manejada con Context API de Firebase.
* **Backend:** Node.js + Express.
  * *REGLA ESTRICTA:* Se debe utilizar la librería `bcryptjs` (implementación pura en JavaScript) en lugar de la librería nativa de Node `bcrypt`. Esto es obligatorio para evitar fallos de compilación cruzada de C++ en el contenedor Docker local y en el entorno de Render de producción.
* **Base de Datos Relacional:** MySQL 8.x (Railway en prod) para datos transaccionales, cuentas, logs y auditoría en 3NF.
* **Base de Datos Documental:** MongoDB (Atlas en prod) dedicada exclusivamente a los mensajes del Foro en tiempo real.
* **Autenticación:** Firebase Auth (Google OAuth).
* **Pruebas:** Jest + Supertest.
* **Infraestructura Local:** Contenedores Docker coordinados por Docker Compose (`node`, `mysql`, `mongodb`).

---

## 5. Reglas de Comunicación Estructurada para la IA
Para garantizar la calidad de las interacciones y el mantenimiento del contexto, la IA debe seguir las siguientes reglas:
1. **Validación del Contexto:** Antes de sugerir cualquier cambio en el backend o frontend, verificar que esté en línea con la arquitectura en N-capas establecida en `README.md`.
2. **Alineación de Base de Datos:** Toda consulta o cambio en el modelo lógico relacional debe respetar el esquema en 3NF del archivo `db-sql.md`.
3. **Manejo de Respuestas de API:** Todas las respuestas HTTP devueltas al cliente deben respetar la estructura estándar `{ success: boolean, data?: object, error?: object }`.
4. **Cero Código Inicial:** No generar código de programación en la fase de planeación documental; todo debe definirse a nivel conceptual y arquitectónico primero.
