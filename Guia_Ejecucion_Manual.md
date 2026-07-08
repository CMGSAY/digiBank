# Guía de Ejecución Manual: DigiBank MVP

Esta guía detalla los pasos para iniciar y ejecutar todos los componentes del sistema **DigiBank MVP** (Bases de datos, Backend API y Frontend) de manera manual en tu entorno local.

---

## 📋 Requisitos Previos

Asegúrate de tener instalados y listos los siguientes programas en tu computadora:
1. **Docker Desktop** (Debe estar abierto y en estado verde *Running*).
2. **Node.js** (Versión 18 o superior) y **npm** (instalador de paquetes).

---

## 🚀 Pasos para Iniciar el Sistema

Sigue estos 3 pasos sencillos en tu terminal (PowerShell, CMD o terminal de VS Code):

### Paso 1: Levantar las Bases de Datos y Backend (Docker)
Abre una terminal, navega a la carpeta principal del proyecto e inicia los contenedores:
```bash
# 1. Navegar a la carpeta raíz del proyecto
cd c:\Users\carlo\Desktop\BankOnline\digibank-mvp

# 2. Iniciar contenedores en segundo plano
docker compose up -d
```
> [!NOTE]
> Este comando levantará tres servicios:
> * **digibank_mysql** (Base de datos relacional) en el puerto `3307`
> * **digibank_mongodb** (Base de datos documental para el foro) en el puerto `27018`
> * **digibank_backend** (API Express de Node.js) en el puerto `3000`

Para verificar que todos los servicios estén corriendo, puedes ejecutar:
```bash
docker compose ps
```

---

### Paso 2: Sembrar la Base de Datos con Datos de Prueba (Seed SQL)
Si es la primera vez que inicias el proyecto, o si deseas restaurar los saldos y usuarios semilla a su estado inicial:
```bash
# Cargar el esquema SQL de semillas en el contenedor MySQL
docker exec -i digibank_mysql mysql -uroot -proot_secure_pass digibank_mvp < database/digibank.sql
```
> [!TIP]
> Esto creará las tablas y sembrará los 3 usuarios de prueba con sus respectivas cuentas en Quetzales (GTQ) y Dólares (USD):
> * `cliente@digibank.com` (Carlos Ortiz - Cliente)
> * `maria@digibank.com` (Cliente)
> * `admin@digibank.com` (Administrador)

---

### Paso 3: Iniciar el Frontend de React (Vite)
Abre **otra terminal diferente** para ejecutar el servidor de desarrollo de la interfaz de usuario:
```bash
# 1. Navegar a la carpeta del frontend
cd c:\Users\carlo\Desktop\BankOnline\digibank-mvp\frontend

# 2. (Opcional) Instalar dependencias si es la primera vez
npm install

# 3. Iniciar el servidor de desarrollo de Vite
npm run dev
```

Una vez que compile, abre tu navegador web favorito e ingresa a:
🔗 **[http://localhost:5173/](http://localhost:5173/)**

---

## 🔑 Credenciales para Pruebas (Sandbox)

Dado que el entorno local corre en modo simulación (Sandbox) para pruebas sin depender de Firebase real:

1. Ve a la página de **Login**.
2. Escribe el correo: **`cliente@digibank.com`**
3. Escribe **cualquier contraseña** (ej. `12345` o `dummy`).
4. Haz clic en **Iniciar sesión**. El sistema te autenticará de inmediato con el perfil de Carlos Ortiz y podrás realizar transferencias internas, cotizar préstamos y participar en el foro en tiempo real.

---

## 🛠️ Comandos de Utilidad

* **Ver los logs de error del backend en tiempo real:**
  ```bash
  docker compose logs -f backend-api
  ```
* **Detener todos los servicios de Docker:**
  ```bash
  docker compose down
  ```
