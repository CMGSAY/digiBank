# Walkthrough - Despliegue de DigiBank MVP

Este documento resume los cambios implementados para habilitar el despliegue del proyecto en producción y detalla los pasos para desplegar el backend en Render, el frontend en Vercel, MongoDB en MongoDB Atlas y MySQL en Aiven.

---

## 🛠️ Cambios y Mejoras Aplicadas

1. **Soporte SSL para MySQL:**
   - Modificamos [db.config.js](file:///c:/Users/PC-DEV4/OneDrive/Desktop/digiBank/digibank-mvp/backend/config/db.config.js) para admitir conexiones SSL seguras requeridas por proveedores de la nube como **Aiven** o **TiDB Cloud** mediante la variable de entorno `DB_SSL=true`.

2. **Dependencia de MongoDB Directa:**
   - Agregamos la dependencia `mongodb` a [package.json](file:///c:/Users/PC-DEV4/OneDrive/Desktop/digiBank/digibank-mvp/backend/package.json) para permitir que el script semilla de MongoDB se ejecute directamente desde Node.js en producción.

3. **Script de Inicialización de BD en la Nube:**
   - Creamos [deploy-setup.js](file:///c:/Users/PC-DEV4/OneDrive/Desktop/digiBank/digibank-mvp/backend/scripts/deploy-setup.js), un script unificado que se conecta a tu MySQL y MongoDB Atlas en la nube, ejecuta el DDL y añade todas las semillas de prueba automáticamente.
   - Añadimos la tarea `"db:setup": "node scripts/deploy-setup.js"` al archivo `package.json` para facilitar su ejecución.

4. **Plantilla de Entorno de Producción:**
   - Creamos [.env.production.example](file:///c:/Users/PC-DEV4/OneDrive/Desktop/digiBank/digibank-mvp/backend/.env.production.example) como referencia clara de las variables de entorno que debes configurar en Render.

5. **Actualización de Repositorio Git:**
   - Commiteamos y subimos todos los cambios a la rama `main` de tu repositorio remoto en [GitHub](https://github.com/CMGSAY/digiBank.git).

6. **Soporte para Cookies Cross-Site (Vercel & Render) y Trust Proxy:**
   - Modificamos [auth.controller.js](file:///c:/Users/carlo/Desktop/BankOnline/digibank-mvp/backend/controllers/auth.controller.js) para que en producción la cookie de sesión `jwt` se envíe con `SameSite=None` y `Secure`. Esto soluciona el bloqueo del navegador al realizar peticiones entre diferentes dominios (`vercel.app` hacia `onrender.com`).
   - Modificamos [server.js](file:///c:/Users/carlo/Desktop/BankOnline/digibank-mvp/backend/server.js) para configurar `app.set('trust proxy', 1)` cuando `NODE_ENV === 'production'`. Esto permite que Express confíe en la cabecera `X-Forwarded-Proto` de Render y reconozca la conexión HTTPS, requisito indispensable para el funcionamiento de cookies seguras.

---

## 🚀 Guía de Despliegue Paso a Paso

### Paso 1: Configurar las Bases de Datos en la Nube

1. **MongoDB Atlas (Base Documental):**
   - Regístrate en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Crea una base de datos gratuita de nivel **M0**.
   - En **Network Access**, agrega la IP `0.0.0.0/0` (permitir todos los accesos).
   - En **Database Access**, crea un usuario con su contraseña.
   - Copia tu URI de conexión (Connection String).

2. **MySQL en Aiven (Base Transaccional):**
   - Regístrate en [Aiven](https://aiven.io/).
   - Crea un nuevo servicio **MySQL** (selecciona el **Free Plan**).
   - Una vez activo ("Running"), copia las credenciales de acceso:
     - **Host**
     - **Port**
     - **User** (`avnadmin`)
     - **Password**
     - **Database** (`defaultdb` o crea una llamada `digibank_mvp`)

---

### Paso 2: Ejecutar la Inicialización de Datos (Migración y Semillas)

> [!NOTE]
> **¡Estado actual: COMPLETADO!** 
> Ya he ejecutado este script de configuración (`npm run db:setup`) exitosamente conectando a tus bases de datos reales en la nube de Aiven y MongoDB Atlas. Todas las tablas, colecciones, índices e inserts semilla de prueba ya han sido creados en tus bases de datos en la nube.
>
> Si por alguna razón necesitas reiniciar o ejecutar la inicialización de nuevo, puedes hacerlo siguiendo estos pasos desde tu consola local:

1. Crea o actualiza tu archivo local `.env` dentro de la carpeta `digibank-mvp/backend/` con las credenciales de la nube:
   ```env
   DB_HOST=tu-host-de-aiven.aivencloud.com
   DB_PORT=puerto-de-aiven
   DB_USER=avnadmin
   DB_PASSWORD=tu-contrasena-de-aiven
   DB_NAME=defaultdb
   DB_SSL=true

   MONGODB_URI=tu-uri-de-mongodb-atlas
   ```
2. Ejecuta el comando de inicialización desde la carpeta `digibank-mvp/backend`:
   ```bash
   npm run db:setup
   ```
   *Esto creará todas las tablas en MySQL, colecciones e índices en MongoDB, e insertará los usuarios y transacciones semilla de prueba.*

---

### Paso 3: Desplegar el Backend en Render

1. Ve a [Render](https://render.com/).
2. Crea un **New Web Service** y conéctalo a tu repositorio de GitHub `CMGSAY/digiBank`.
3. Configura las siguientes opciones:
   - **Root Directory:** `digibank-mvp/backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. En **Environment Variables**, añade:
   - `NODE_ENV=production`
   - `DB_HOST` = *(Tu host de Aiven)*
   - `DB_PORT` = *(Tu puerto de Aiven)*
   - `DB_USER` = `avnadmin`
   - `DB_PASSWORD` = *(Tu contraseña de Aiven)*
   - `DB_NAME` = *(Tu base de datos de Aiven)*
   - `DB_SSL` = `true`
   - `MONGODB_URI` = *(Tu URI de MongoDB Atlas)*
   - `JWT_SECRET` = *(Una cadena aleatoria larga y segura)*
   - `FRONTEND_URL` = *(La URL que te asigne Vercel en el Paso 4, ej: `https://digibank-frontend.vercel.app`)*

---

### Paso 4: Desplegar el Frontend en Vercel

1. Ve a [Vercel](https://vercel.com/).
2. Importa el repositorio `CMGSAY/digiBank`.
3. Configura el proyecto:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `digibank-mvp/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. En **Environment Variables**, añade:
   - `VITE_API_URL` = `https://<nombre-de-tu-app-en-render>.onrender.com/api/v1`
5. Haz clic en **Deploy**.

¡Felicidades! Todo tu proyecto de DigiBank MVP estará desplegado y conectado en la nube.
