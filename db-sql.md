# Diseño de Base de Datos Relacional: MySQL (3NF)

Este documento detalla la estructura lógica de la base de datos relacional de DigiBank MVP para MySQL 8.x. El diseño está estrictamente normalizado en **Tercera Forma Normal (3NF)** para evitar redundancia de datos y garantizar la integridad referencial en transacciones bancarias críticas.

---

## 1. Justificaciones Arquitectónicas (Seguridad y ACID)
* **Consistencia e Integridad (ACID):** El motor relacional a utilizar es **InnoDB** debido a su soporte para transacciones seguras, bloqueos de fila selectivos (`SELECT ... FOR UPDATE`) y cumplimiento del estándar ACID.
* **Inmutabilidad Financiera:** La tabla de transacciones y la tabla de auditoría son de solo inserción (*insert-only*). Ninguna actualización (*update*) o eliminación (*delete*) está permitida sobre estos registros para asegurar auditorías limpias y trazabilidad bancaria.
* **Separación de Identidad:** La autenticación federada (Firebase Google OAuth) se desacopla mediante campos opcionales en la tabla de usuarios, permitiendo la coexistencia limpia de login local e identidad en la nube.
* **Tratamiento del Dinero:** Todos los montos monetarios se almacenan utilizando el tipo de datos `DECIMAL(15, 2)` con restricciones `CHECK` positivas para prevenir desbordamientos o valores negativos que vulneren la lógica de saldos.

---

## 2. Estructura de Tablas (Tercera Forma Normal)

### 2.1. Tabla: ROLES
Define el nivel jerárquico y permisos del usuario.
* **id_rol** (INT, PK, Auto-increment)
* **nombre_rol** (VARCHAR(50), UNIQUE, NOT NULL): 'ADMIN', 'TRABAJADOR_OPERACIONES', 'TRABAJADOR_SOPORTE', 'CLIENTE'.
* **descripcion** (TEXT)

### 2.2. Tabla: USUARIOS
Guarda la identidad e información personal de acceso.
* **id_usuario** (INT, PK, Auto-increment)
* **id_rol** (INT, FK referenciando a `ROLES.id_rol`, ON DELETE RESTRICT)
* **firebase_uid** (VARCHAR(128), UNIQUE, NULL): Identificador único de Firebase Auth.
* **nombres** (VARCHAR(100), NOT NULL): Separado de apellidos para KYC.
* **apellidos** (VARCHAR(100), NOT NULL)
* **email** (VARCHAR(255), UNIQUE, NOT NULL)
* **password_hash** (VARCHAR(255), NULL): Hash generado con `bcryptjs` (solo para credenciales locales).
* **debe_cambiar_password** (BOOLEAN, DEFAULT TRUE)
* **estado** (ENUM('ACTIVO', 'BLOQUEADO', 'INACTIVO'), DEFAULT 'ACTIVO')
* **fecha_creacion** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 2.3. Tabla: MONEDAS
Soporta las divisas autorizadas por la plataforma.
* **id_moneda** (INT, PK, Auto-increment)
* **codigo_iso** (VARCHAR(3), UNIQUE, NOT NULL): Ej. 'GTQ', 'USD', 'EUR'.
* **nombre** (VARCHAR(50), NOT NULL)
* **simbolo** (VARCHAR(5), NOT NULL)

### 2.4. Tabla: TASAS_CAMBIO
Almacena el historial y las tasas de cambio de divisas vigentes.
* **id_tasa** (INT, PK, Auto-increment)
* **id_moneda_origen** (INT, FK referenciando a `MONEDAS.id_moneda`, ON DELETE RESTRICT)
* **id_moneda_destino** (INT, FK referenciando a `MONEDAS.id_moneda`, ON DELETE RESTRICT)
* **tasa_compra** (DECIMAL(10, 6), NOT NULL, CHECK > 0)
* **tasa_venta** (DECIMAL(10, 6), NOT NULL, CHECK > 0)
* **activo** (BOOLEAN, DEFAULT TRUE): Flag para definir la tasa oficial actual del par.
* **fecha_vigencia** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 2.5. Tabla: CUENTAS
Representa los depósitos de fondos del cliente.
* **id_cuenta** (INT, PK, Auto-increment)
* **id_usuario** (INT, FK referenciando a `USUARIOS.id_usuario`, ON DELETE RESTRICT)
* **id_moneda** (INT, FK referenciando a `MONEDAS.id_moneda`, ON DELETE RESTRICT)
* **numero_cuenta** (VARCHAR(10), UNIQUE, NOT NULL): Número aleatorio validado con algoritmo de Luhn.
* **tipo_cuenta** (VARCHAR(50), DEFAULT 'MONETARIA')
* **saldo** (DECIMAL(15, 2), NOT NULL, DEFAULT 0.00, CHECK >= 0.00)
* **estado** (ENUM('ACTIVA', 'BLOQUEADA', 'CERRADA'), DEFAULT 'ACTIVA')
* **fecha_apertura** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 2.6. Tabla: TRANSACCIONES (Insert-Only)
Registro inmutable de movimientos financieros.
* **id_transaccion** (INT, PK, Auto-increment)
* **id_cuenta_origen** (INT, FK referenciando a `CUENTAS.id_cuenta` - Nullable para depósitos, ON DELETE RESTRICT)
* **id_cuenta_destino** (INT, FK referenciando a `CUENTAS.id_cuenta`, ON DELETE RESTRICT)
* **monto_origen** (DECIMAL(15, 2), NOT NULL, CHECK > 0)
* **monto_destino** (DECIMAL(15, 2), NOT NULL, CHECK > 0)
* **id_tasa_aplicada** (INT, FK referenciando a `TASAS_CAMBIO.id_tasa` - Nullable, ON DELETE RESTRICT)
* **tipo** (ENUM('TRANSFERENCIA', 'CONVERSION', 'DESEMBOLSO', 'DEPOSITO'), NOT NULL)
* **descripcion** (VARCHAR(255))
* **numero_referencia** (VARCHAR(20), UNIQUE, NOT NULL)
* **estado** (ENUM('COMPLETADA', 'REVERTIDA', 'FALLIDA'), DEFAULT 'COMPLETADA')
* **fecha** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 2.7. Tabla: PRESTAMOS
Control y aprobación de solicitudes crediticias.
* **id_prestamo** (INT, PK, Auto-increment)
* **id_usuario_solicitante** (INT, FK referenciando a `USUARIOS.id_usuario`, ON DELETE RESTRICT)
* **id_cuenta_desembolso** (INT, FK referenciando a `CUENTAS.id_cuenta`, ON DELETE RESTRICT)
* **monto_solicitado** (DECIMAL(15, 2), NOT NULL, CHECK > 0)
* **ingresos_declarados** (DECIMAL(15, 2), NOT NULL, CHECK > 0)
* **estado** (ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO'), DEFAULT 'PENDIENTE')
* **id_usuario_revisor** (INT, FK referenciando a `USUARIOS.id_usuario` - Nullable, ON DELETE RESTRICT)
* **comentario_revisor** (TEXT)
* **fecha_solicitud** (DATETIME, DEFAULT CURRENT_TIMESTAMP)
* **fecha_resolucion** (DATETIME)

### 2.8. Tabla: BENEFICIARIOS
Cuentas de terceros agendadas por el cliente.
* **id_beneficiario** (INT, PK, Auto-increment)
* **id_usuario_propietario** (INT, FK referenciando a `USUARIOS.id_usuario`, ON DELETE CASCADE)
* **id_cuenta_destino** (INT, FK referenciando a `CUENTAS.id_cuenta`, ON DELETE CASCADE)
* **alias** (VARCHAR(100), NOT NULL)

### 2.9. Tabla: AUDIT_LOG (Insert-Only)
Registro de eventos de seguridad y negocio para auditoría.
* **id_log** (BIGINT, PK, Auto-increment)
* **id_usuario** (INT, FK referenciando a `USUARIOS.id_usuario` - Nullable, ON DELETE SET NULL)
* **accion** (VARCHAR(100), NOT NULL)
* **ip_origen** (VARCHAR(45), NOT NULL)
* **endpoint** (VARCHAR(255), NOT NULL)
* **detalle_json** (JSON): Parámetros de petición sanitizados.
* **resultado** (ENUM('EXITO', 'FALLO', 'BLOQUEADO'), NOT NULL)
* **timestamp** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

---

## 3. Índices Recomendados
Para agilizar consultas complejas y mantener tiempos de respuesta de milisegundos en base de datos:
* **USUARIOS:** Índice sobre `email` para agilizar autenticación, e índice sobre `firebase_uid`.
* **CUENTAS:** Índice sobre `numero_cuenta` para validación rápida en transferencias, e índice compuesto en `(id_usuario, estado)`.
* **TRANSACCIONES:** Índice compuesto sobre `(id_cuenta_origen, fecha)` y `(id_cuenta_destino, fecha)` para la paginación rápida del historial de movimientos.
* **TASAS_CAMBIO:** Índice compuesto sobre `(id_moneda_origen, id_moneda_destino, activo)`.
* **AUDIT_LOG:** Índice sobre `timestamp` para consultas de administración e informes periódicos.
