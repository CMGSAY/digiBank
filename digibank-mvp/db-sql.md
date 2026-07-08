# Arquitectura de Base de Datos Relacional (MySQL)

Este documento detalla el diseño de la base de datos relacional para DigiBank MVP utilizando MySQL. El objetivo es soportar el núcleo transaccional garantizando las propiedades **ACID** (Atomidad, Consistencia, Aislamiento y Durabilidad).

---

## 1. Modelo Físico de Datos (3NF)

### Tabla: `USUARIOS`
Almacena las credenciales principales del banco.
* `id_usuario` INT AUTO_INCREMENT (PK)
* `nombres` VARCHAR(100) NOT NULL
* `apellidos` VARCHAR(100) NOT NULL
* `username` VARCHAR(50) UNIQUE NOT NULL
* `email` VARCHAR(100) UNIQUE NOT NULL
* `contrasenia` VARCHAR(255) NOT NULL
* `rol` ENUM('CLIENTE', 'TRABAJADOR', 'ADMINISTRADOR') DEFAULT 'CLIENTE'
* `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP

### Tabla: `MONEDAS`
Catálogo de divisas autorizadas por el banco.
* `id_moneda` INT AUTO_INCREMENT (PK)
* `codigo_iso` CHAR(3) UNIQUE NOT NULL  -- Ej: 'GTQ', 'USD', 'EUR'
* `simbolo` VARCHAR(5) NOT NULL        -- Ej: 'Q', '$', '€'
* `nombre` VARCHAR(50) NOT NULL

### Tabla: `CUENTAS`
Cuentas monetarias o de ahorro de los clientes.
* `id_cuenta` INT AUTO_INCREMENT (PK)
* `id_usuario` INT NOT NULL (FK -> `USUARIOS.id_usuario` ON DELETE RESTRICT)
* `id_moneda` INT NOT NULL (FK -> `MONEDAS.id_moneda` ON DELETE RESTRICT)
* `numero_cuenta` CHAR(10) UNIQUE NOT NULL
* `tipo_cuenta` ENUM('MONETARIA', 'AHORRO') DEFAULT 'MONETARIA'
* `saldo` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (`saldo` >= 0)
* `estado` ENUM('ACTIVA', 'CONGELADA', 'CERRADA') DEFAULT 'ACTIVA'
* `fecha_apertura` DATETIME DEFAULT CURRENT_TIMESTAMP

### Tabla: `TRANSACCIONES`
Registro inmutable de movimientos financieros.
* `id_transaccion` INT AUTO_INCREMENT (PK)
* `id_cuenta_origen` INT NULL (FK -> `CUENTAS.id_cuenta` ON DELETE RESTRICT)
* `id_cuenta_destino` INT NOT NULL (FK -> `CUENTAS.id_cuenta` ON DELETE RESTRICT)
* `monto_origen` DECIMAL(15, 2) NOT NULL CHECK (`monto_origen` > 0)
* `monto_destino` DECIMAL(15, 2) NOT NULL CHECK (`monto_destino` > 0)
* `id_tasa_aplicada` INT NULL
* `tipo` ENUM('TRANSFERENCIA', 'CONVERSION', 'DESEMBOLSO', 'DEPOSITO') NOT NULL
* `descripcion` VARCHAR(255) NOT NULL
* `numero_referencia` VARCHAR(50) UNIQUE NOT NULL
* `estado` ENUM('COMPLETADA', 'RECHAZADA') DEFAULT 'COMPLETADA'
* `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP

### Tabla: `PRESTAMOS`
Soporte de financiamientos solicitados por clientes.
* `id_prestamo` INT AUTO_INCREMENT (PK)
* `id_usuario_solicitante` INT NOT NULL (FK -> `USUARIOS.id_usuario` ON DELETE RESTRICT)
* `id_cuenta_desembolso` INT NOT NULL (FK -> `CUENTAS.id_cuenta` ON DELETE RESTRICT)
* `monto_solicitado` DECIMAL(15, 2) NOT NULL CHECK (`monto_solicitado` > 0)
* `ingresos_declarados` DECIMAL(15, 2) NOT NULL CHECK (`ingresos_declarados` > 0)
* `estado` ENUM('PENDIENTE', 'PENDIENTE_VALIDACION', 'APROBADO', 'RECHAZADO') DEFAULT 'PENDIENTE'
* `id_usuario_revisor` INT NULL (FK -> `USUARIOS.id_usuario` ON DELETE RESTRICT)
* `comentario_revisor` TEXT NULL
* `saldo_pendiente` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
* `cuota_mensual` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
* `fecha_limite_pago` DATE NULL
* `fecha_solicitud` DATETIME DEFAULT CURRENT_TIMESTAMP
* `fecha_resolucion` DATETIME NULL

---

## 2. Justificación Arquitectónica (MySQL)

1. **Garantía ACID**: Las transferencias monetarias y los pagos de cuotas requieren consistencia absoluta. Si el débito en la cuenta origen tiene éxito pero la acreditación en destino falla, toda la transacción debe revertirse mediante `ROLLBACK`. MySQL (motor InnoDB) maneja esto eficientemente usando bloqueos de fila (`SELECT ... FOR UPDATE`).
2. **Integridad Referencial Estricta**: La regla `ON DELETE RESTRICT` en las llaves foráneas previene la eliminación accidental de un usuario o cuenta que posea registros de movimientos o préstamos asociados, asegurando la inmutabilidad histórica para auditorías.
3. **Restricciones de Dominio (Check Constraints)**: El uso de `CHECK (saldo >= 0)` a nivel de base de datos actúa como una última línea de defensa contra saldos negativos (sobregiros no autorizados) ante cualquier eventual falla lógica del backend.
