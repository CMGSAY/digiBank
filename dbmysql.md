-- DDL completo y Datos de Prueba realistas para MySQL 8.x - DigiBank MVP
-- Normalización: Tercera Forma Normal (3NF)

CREATE TABLE IF NOT EXISTS ROLES (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MONEDAS (
    id_moneda INT AUTO_INCREMENT PRIMARY KEY,
    codigo_iso VARCHAR(3) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(5) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS USUARIOS (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    firebase_uid VARCHAR(128) NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    debe_cambiar_password BOOLEAN DEFAULT TRUE,
    estado ENUM('ACTIVO', 'BLOQUEADO', 'INACTIVO') DEFAULT 'ACTIVO',
    dpi VARCHAR(13) NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES ROLES(id_rol) ON DELETE RESTRICT,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_firebase (firebase_uid)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS TASAS_CAMBIO (
    id_tasa INT AUTO_INCREMENT PRIMARY KEY,
    id_moneda_origen INT NOT NULL,
    id_moneda_destino INT NOT NULL,
    tasa_compra DECIMAL(10, 6) NOT NULL CHECK (tasa_compra > 0),
    tasa_venta DECIMAL(10, 6) NOT NULL CHECK (tasa_venta > 0),
    activo BOOLEAN DEFAULT TRUE,
    fecha_vigencia DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_moneda_origen) REFERENCES MONEDAS(id_moneda) ON DELETE RESTRICT,
    FOREIGN KEY (id_moneda_destino) REFERENCES MONEDAS(id_moneda) ON DELETE RESTRICT,
    INDEX idx_tasas_activo (id_moneda_origen, id_moneda_destino, activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CUENTAS (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_moneda INT NOT NULL,
    numero_cuenta VARCHAR(10) NOT NULL UNIQUE,
    tipo_cuenta VARCHAR(50) DEFAULT 'MONETARIA',
    saldo DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0.00),
    estado ENUM('ACTIVA', 'BLOQUEADA', 'CERRADA') DEFAULT 'ACTIVA',
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_moneda) REFERENCES MONEDAS(id_moneda) ON DELETE RESTRICT,
    INDEX idx_cuentas_numero (numero_cuenta),
    INDEX idx_cuentas_usuario (id_usuario, estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS TRANSACCIONES (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta_origen INT NULL,
    id_cuenta_destino INT NOT NULL,
    monto_origen DECIMAL(15, 2) NOT NULL CHECK (monto_origen > 0),
    monto_destino DECIMAL(15, 2) NOT NULL CHECK (monto_destino > 0),
    id_tasa_aplicada INT NULL,
    tipo ENUM('TRANSFERENCIA', 'CONVERSION', 'DESEMBOLSO', 'DEPOSITO') NOT NULL,
    descripcion VARCHAR(255),
    numero_referencia VARCHAR(20) NOT NULL UNIQUE,
    estado ENUM('COMPLETADA', 'REVERTIDA', 'FALLIDA') DEFAULT 'COMPLETADA',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta_origen) REFERENCES CUENTAS(id_cuenta) ON DELETE RESTRICT,
    FOREIGN KEY (id_cuenta_destino) REFERENCES CUENTAS(id_cuenta) ON DELETE RESTRICT,
    FOREIGN KEY (id_tasa_aplicada) REFERENCES TASAS_CAMBIO(id_tasa) ON DELETE RESTRICT,
    INDEX idx_txs_origen (id_cuenta_origen, fecha),
    INDEX idx_txs_destino (id_cuenta_destino, fecha)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PRESTAMOS (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_solicitante INT NOT NULL,
    id_cuenta_desembolso INT NOT NULL,
    monto_solicitado DECIMAL(15, 2) NOT NULL CHECK (monto_solicitado > 0),
    ingresos_declarados DECIMAL(15, 2) NOT NULL CHECK (ingresos_declarados > 0),
    estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    id_usuario_revisor INT NULL,
    comentario_revisor TEXT,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME NULL,
    FOREIGN KEY (id_usuario_solicitante) REFERENCES USUARIOS(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_cuenta_desembolso) REFERENCES CUENTAS(id_cuenta) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_revisor) REFERENCES USUARIOS(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS BENEFICIARIOS (
    id_beneficiario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_propietario INT NOT NULL,
    id_cuenta_destino INT NOT NULL,
    alias VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_usuario_propietario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cuenta_destino) REFERENCES CUENTAS(id_cuenta) ON DELETE CASCADE,
    UNIQUE KEY uq_beneficiario (id_usuario_propietario, id_cuenta_destino)
) ENGINE=InnoDB;

-- ==========================================
-- DATOS SEMILLA (ROLES, MONEDAS, TASAS)
-- ==========================================

INSERT INTO ROLES (id_rol, nombre_rol, descripcion) VALUES
(1, 'ADMIN', 'Administrador con acceso total al sistema'),
(2, 'TRABAJADOR_OPERACIONES', 'Trabajador que revisa y aprueba préstamos'),
(3, 'TRABAJADOR_SOPORTE', 'Trabajador de soporte con acceso de solo lectura'),
(4, 'CLIENTE', 'Usuario final del banco');

INSERT INTO MONEDAS (id_moneda, codigo_iso, nombre, simbolo) VALUES
(1, 'GTQ', 'Quetzal Guatemalteco', 'Q'),
(2, 'USD', 'Dólar Estadounidense', '$');

-- Tasa de cambio de prueba (GTQ <=> USD)
INSERT INTO TASAS_CAMBIO (id_tasa, id_moneda_origen, id_moneda_destino, tasa_compra, tasa_venta, activo) VALUES
(1, 1, 2, 7.730000, 7.780000, TRUE), -- GTQ a USD
(2, 2, 1, 0.127000, 0.129000, TRUE); -- USD a GTQ


-- ==========================================
-- USUARIOS DE PRUEBA (Todos los passwords son "123456")
-- ==========================================

INSERT INTO USUARIOS (id_usuario, id_rol, firebase_uid, nombres, apellidos, email, password_hash, debe_cambiar_password, estado, dpi) VALUES
-- Administrador / Gerente
(1, 1, 'mock-uid-admin-gerente-999', 'Admin', 'General', 'admin@digibank.com', '$2a$10$tZ8e1pW/fW2Hq53vOa52mO6Qo/t20i.73gWk3g.XjE0Wl5C6KqN5y', FALSE, 'ACTIVO', '2999000000101'),

-- Colaboradores (Empleados de Ventanilla)
(2, 2, 'mock-uid-empleado-juan-101', 'Juan', 'Pérez', 'empleado@digibank.com', '$2a$10$tZ8e1pW/fW2Hq53vOa52mO6Qo/t20i.73gWk3g.XjE0Wl5C6KqN5y', FALSE, 'ACTIVO', '1999888880101'),
(3, 2, 'mock-uid-empleado-maria-102', 'María', 'Gómez', 'maria.empleado@digibank.com', '$2a$10$tZ8e1pW/fW2Hq53vOa52mO6Qo/t20i.73gWk3g.XjE0Wl5C6KqN5y', FALSE, 'ACTIVO', '1999777770101'),

-- Clientes / Asociados
(4, 4, 'mock-uid-carlos-cliente-201', 'Carlos', 'Ortiz', 'cliente@digibank.com', '$2a$10$tZ8e1pW/fW2Hq53vOa52mO6Qo/t20i.73gWk3g.XjE0Wl5C6KqN5y', FALSE, 'ACTIVO', '3020101010101'),
(5, 4, 'mock-uid-ana-cliente-202', 'Ana', 'López', 'ana@digibank.com', '$2a$10$tZ8e1pW/fW2Hq53vOa52mO6Qo/t20i.73gWk3g.XjE0Wl5C6KqN5y', FALSE, 'ACTIVO', '2584102930101');


-- ==========================================
-- CUENTAS BANCARIAS
-- ==========================================

INSERT INTO CUENTAS (id_cuenta, id_usuario, id_moneda, numero_cuenta, tipo_cuenta, saldo, estado) VALUES
-- Cuentas de Carlos Ortiz
(1, 4, 1, '0100000001', 'MONETARIA', 15000.00, 'ACTIVA'),  -- Carlos Q.
(2, 4, 2, '0200000001', 'AHORROS', 2500.00, 'ACTIVA'),     -- Carlos $

-- Cuentas de Ana López
(3, 5, 1, '0100000002', 'MONETARIA', 8350.00, 'ACTIVA'),   -- Ana Q.
(4, 5, 2, '0200000002', 'AHORROS', 500.00, 'ACTIVA'),      -- Ana $

-- Cuenta del Administrador
(5, 1, 1, '0100000003', 'MONETARIA', 250000.00, 'ACTIVA'); -- Admin Q.


-- ==========================================
-- TRANSACCIONES BANCARIAS REALISTAS
-- ==========================================

INSERT INTO TRANSACCIONES (id_cuenta_origen, id_cuenta_destino, monto_origen, monto_destino, id_tasa_aplicada, tipo, descripcion, numero_referencia, estado, fecha) VALUES
-- Depósito de Apertura de Carlos
(NULL, 1, 15000.00, 15000.00, NULL, 'DEPOSITO', 'Apertura de Cuenta en Ventanilla', 'DP-1783119361001', 'COMPLETADA', '2026-07-01 09:00:00'),
(NULL, 2, 2500.00, 2500.00, NULL, 'DEPOSITO', 'Apertura de Cuenta Ahorros Dólares', 'DP-1783119361002', 'COMPLETADA', '2026-07-01 09:15:00'),

-- Transferencia de Carlos a Ana
(1, 3, 1500.00, 1500.00, NULL, 'TRANSFERENCIA', 'Pago de servicios profesionales', 'TR-1783119361003', 'COMPLETADA', '2026-07-02 14:30:00'),

-- Conversión de Monedas propia de Carlos (De Quetzales a Dólares)
(1, 2, 773.00, 100.00, 1, 'CONVERSION', 'Compra de Divisas Online', 'CV-1783119361004', 'COMPLETADA', '2026-07-03 10:00:00');


-- ==========================================
-- SOLICITUDES DE PRÉSTAMO
-- ==========================================

INSERT INTO PRESTAMOS (id_prestamo, id_usuario_solicitante, id_cuenta_desembolso, monto_solicitado, ingresos_declarados, estado, id_usuario_revisor, comentario_revisor, fecha_solicitud, fecha_resolucion) VALUES
-- Carlos tiene un préstamo aprobado
(1, 4, 1, 5000.00, 8500.00, 'APROBADO', 2, 'Aprobado tras verificar constancia de ingresos', '2026-07-02 10:00:00', '2026-07-02 11:30:00'),

-- Ana tiene un préstamo pendiente de revisión
(2, 5, 3, 12000.00, 15000.00, 'PENDIENTE', NULL, NULL, '2026-07-03 16:45:00', NULL);


-- ==========================================
-- BENEFICIARIOS (Contactos Agendados)
-- ==========================================

INSERT INTO BENEFICIARIOS (id_usuario_propietario, id_cuenta_destino, alias) VALUES
(4, 3, 'Ana López (Monetaria)');


