# Resumen de Ejecución: Validación Segura de Logins, Contraseñas Genéricas y Vinculación por Email

Se han reparado los dos fallos críticos reportados sobre el login y la asignación/creación de colaboradores:

---

## 🛠 Cambios y Mejoras Aplicadas

### 1. Bloqueo de Logins No Registrados
* Modifiqué `vincularOUsuarioGoogle` en `auth.service.js` para que **ya no auto-registre** correos arbitrarios.
* Si el correo ingresado en el login no existe previamente en la tabla `USUARIOS` de MySQL, el sistema rechaza la solicitud de inmediato arrojando un error `401 Unauthorized` con el mensaje: *«El correo electrónico ingresado no está registrado en DigiBank.»*

### 2. Vinculación Inteligente por Email (Evitando Usuario Genérico)
* Anteriormente, al iniciar sesión, el sistema buscaba únicamente por `firebase_uid`. Si el administrador registraba un empleado con un UID simulado aleatorio, al hacer login con el correo real, el backend no encontraba el UID, creaba un cliente genérico nuevo y el usuario entraba al portal equivocado.
* Ahora, si no se encuentra por UID, el sistema realiza una segunda búsqueda por `email`. Si existe, **vincula automáticamente** el UID actual a dicho registro y le otorga su rol correcto (`ADMIN`, `TRABAJADOR_OPERACIONES`, etc.) de manera inmediata.

### 3. Validación de Contraseña Cifrada (Bcrypt)
* Tanto al registrar un nuevo **Asociado** (desde el portal de empleado) como al crear un nuevo **Colaborador** (desde el portal del administrador), se requiere ingresar una **Contraseña Genérica**.
* El backend cifra esta contraseña usando `bcryptjs` y la guarda de forma segura en `password_hash`.
* Al iniciar sesión, el controlador valida la contraseña enviada usando `bcrypt.compare`. Si es incorrecta, deniega la sesión.
* *Nota:* Para los usuarios semilla de pruebas iniciales (`cliente@digibank.com`, `admin@digibank.com`, `empleado@digibank.com`), la base de datos conserva su `password_hash` en `NULL`, lo que les permite acceder sin contraseña para agilizar las pruebas locales del MVP.

---

## 👥 Credenciales de Prueba Actualizadas

| Rol | Usuario / Email | Contraseña | Destino en Sidebar |
| :--- | :--- | :--- | :--- |
| **Gerente (Admin)** | `admin@digibank.com` (o `admin`) | *Cualquiera* | `/admin/dashboard` |
| **Empleado** | `empleado@digibank.com` (o `empleado`) | *Cualquiera* | `/worker/caja` |
| **Cliente** | `cliente@digibank.com` (o `cliente`) | *Cualquiera* | `/banca/resumen` |
