
---

## Visión Arquitectónica: Plataforma DigiBank

**DigiBank** es un sistema de banca en línea interactivo y web-responsivo, diseñado para ofrecer una experiencia de usuario fluida y segura. El sistema permite a los clientes autogestionar su dinero en múltiples monedas, realizar transferencias internas y solicitar productos financieros, mientras provee al banco de herramientas administrativas segmentadas por niveles de acceso.

### 1. Infraestructura y Arquitectura Base

El proyecto se construirá bajo un modelo de **arquitectura desacoplada**, separando por completo la interfaz visual del motor de procesamiento:

* **Capa de Presentación (Frontend):** Una aplicación de alto rendimiento, altamente interactiva, optimizada para plataformas de despliegue continuo orientadas al rendimiento (como Vercel).


* **Capa de Servicios (Backend):** Una API RESTful independiente (construida en Node.js) que procesará la lógica de negocio y se comunicará con la base de datos.



### 2. Control de Acceso y Ecosistema de Usuarios (RBAC)

El sistema utilizará un único formulario de inicio de sesión. El backend distribuirá a los usuarios hacia entornos aislados mediante la validación de tokens (JWT), bajo los siguientes roles estrictos:

| Rol | Entorno Asignado | Permisos Principales |
| --- | --- | --- |
| **Cliente** | Dashboard Personal | Ver cuentas, realizar transferencias propias/a terceros, convertir monedas, solicitar préstamos, descargar estados de cuenta.

 |
| **Asistencia (Soporte)** | Mesa de Ayuda | Acceso de "solo lectura" a perfiles e historiales para resolver dudas. Capacidad de bloqueo preventivo de tarjetas. Sin permisos transaccionales.

 |
| **Trabajador** | Back-office Operativo | Revisión y aprobación manual de solicitudes de préstamos, búsqueda de perfiles de clientes, autorización de trámites en agencia.

 |
| **Administrador** | Panel de Gerencia | Creación de cuentas y perfiles de clientes, gestión global del sistema, definición del precio de divisas y tasas de interés.

 |

### 3. Módulos Core y Lógica de Negocio

**A. Portal Público (Landing Page)**

* Interfaz pública que ofrece información institucional, malla de servicios, y herramientas utilitarias sin necesidad de registro: un cotizador de préstamos y un visualizador del tipo de cambio.


* La API del tipo de cambio contará con limitación de peticiones (*rate limiting*) para prevenir saturación.



**B. Núcleo Financiero (Cuentas y Transferencias)**

* **Generador Algorítmico:** Las cuentas tendrán 10 dígitos (prefijo lógico + núcleo aleatorio + dígito verificador). El sistema validará contra colisiones en la base de datos para garantizar unicidad absoluta antes de registrar al cliente y enviarle una contraseña temporal.


* **Billetera Multimoneda:** El cliente visualizará sus cuentas separadas en tarjetas interactivas, con indicadores visuales claros según la moneda (Quetzales, Dólares, Euros).


* **Transferencias Internas y Conversión:** Módulo para guardar beneficiarios (Directorio) y transferir fondos de manera atómica (ACID). Si la transacción es multidivisa, el sistema aplicará la tasa de cambio vigente y su margen de ganancia automáticamente.



**C. Gestión de Préstamos (Máquina de Estados)**

* Sistema de auto-servicio donde el cliente llena un formulario inteligente (con datos de identidad bloqueados por seguridad).


* El registro nace en estado `PENDIENTE`.


* El rol "Trabajador" revisa y decide. Si se aprueba, el sistema desembolsa el dinero automáticamente a la cuenta del cliente y genera la tabla de amortización. También existirá un flujo de aprobación automática por algoritmo para montos pequeños.



**D. Historial y Reportería**

* **Vista Interactiva:** Tabla paginada de movimientos recientes con filtros por fecha y código de colores (verde para ingresos, rojo para egresos).


* **Generación de Documentos:** El sistema dibujará y entregará PDFs al instante cuando el cliente requiera un "Estado de Cuenta al Momento", y generará reportes mensuales de forma automática mediante tareas programadas (*cron jobs*).



### 4. Estándares de Seguridad Transaccional

* **Integridad de Datos:** Cualquier movimiento de dinero (transferencia, conversión, desembolso) se ejecutará bajo bloques transaccionales. Si el sistema falla milisegundos antes de completar un abono, el débito se revierte de inmediato.


* **Manejo de Criptografía:** Se utilizarán implementaciones puras como `bcryptjs` para el cifrado de contraseñas, garantizando compatibilidad absoluta con entornos en la nube y evitando fallos de compilación.



---

Esta síntesis limpia la paja del trigo y deja el proyecto estructurado exactamente como lo pensaste, pero con un lenguaje que los desarrolladores amarán.


Ese análisis que te pasaron es **oro puro**. Es exactamente el nivel de escrutinio que un proyecto de esta magnitud necesita para que la arquitectura no se agriete cuando esté en producción. Los cuatro puntos que toca son decisiones críticas que debemos dejar plasmadas en el SRS y el DDS.

Aquí tienes mi perspectiva técnica para resolver y cerrar cada uno de estos puntos de forma definitiva:

### 1. Roles: Definición Exacta y Permisos

Para mantener el código de tu API limpio y seguro, la mejor práctica en un Control de Acceso Basado en Roles (RBAC) es que la base de datos tenga roles distintos y explícitos, en lugar de un solo "Trabajador" con interruptores complejos.

Te recomiendo que en la base de datos existan estos 4 roles fijos. Así, los *middlewares* de tus rutas en Node.js serán muy fáciles de leer y auditar:

* **`ADMIN`**: Tiene acceso total. Fija las tasas de cambio y crea los perfiles de los trabajadores.
* **`TRABAJADOR_OPERACIONES`** (Créditos): Su panel solo le permite ver la cola de solicitudes y aprobar/rechazar préstamos o aperturas de cuentas.
* **`TRABAJADOR_SOPORTE`** (Asistencia): Su panel es de solo lectura. Puede buscar clientes, ver historiales y bloquear cuentas, pero los botones de "Aprobar dinero" simplemente no existen en su interfaz.
* **`CLIENTE`**: El usuario final del banco.

### 2. Origen del Tipo de Cambio

El análisis tiene toda la razón. Para un MVP (Producto Mínimo Viable), **la opción manual es la decisión arquitectónica correcta.**

Depender de una API externa desde el día 1 introduce un riesgo innecesario (si la API del Banco de Guatemala se cae, tu calculadora y tus transferencias internas fallarían).

* **Solución:** El `ADMIN` tendrá un pequeño formulario en su panel donde ingresará el precio de Compra y Venta del día. Tu base de datos guardará ese valor y todo el sistema (la calculadora pública y las conversiones internas) lo consumirá desde ahí.

### 3. Creación de Clientes y Contraseña Temporal

Dejar una contraseña generada por el sistema activa indefinidamente es una vulnerabilidad crítica de seguridad web. El flujo obligatorio debe ser este:

1. El Trabajador crea la cuenta. El sistema genera una clave temporal (ej. `DigiBank-8f2a`) y la envía por correo.
2. En la base de datos, el usuario se crea con un campo extra: `debe_cambiar_password = true`.
3. El cliente inicia sesión por primera vez.
4. El backend verifica sus credenciales y lee el campo `debe_cambiar_password`. Como es `true`, **no le muestra el dashboard**. En su lugar, el frontend lo encierra en una pantalla obligatoria de "Actualizar Contraseña".
5. El cliente ingresa su nueva clave, el backend la encripta (usando `bcryptjs` para asegurar que compile perfecto en tu servidor), actualiza la base de datos, cambia el campo a `false` y ahora sí, lo deja entrar al resumen de sus cuentas.

### 4. Transferencias entre Cuentas de Distinta Moneda (El punto cortado)

Noté que el punto 4 se cortó al final de tu mensaje y quedó incompleto.

Para cerrar esta última brecha lógica y pasar a redactar el Project Charter y el SRS: **¿Tu idea para el punto 4 era definir si permitiremos que un usuario le transfiera Quetzales directamente a la cuenta de Dólares de otro usuario (aplicando la conversión en el aire), o prefieres la regla estricta de que las transferencias a terceros solo se puedan hacer si ambas cuentas manejan la misma moneda?**
si 