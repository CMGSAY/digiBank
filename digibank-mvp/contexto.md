# Contexto de DigiBank MVP

## 1. Rol Técnico
* **Rol**: Arquitecto de Software y Desarrollador Full-Stack.
* **Misión**: Diseñar la arquitectura híbrida de base de datos y establecer el plan de trabajo para completar e integrar el backend real de la aplicación con la interfaz de usuario.

## 2. Contexto del Proyecto
Tras el diagnóstico inicial del MVP de DigiBank, el estado actual de los módulos es el siguiente:
* **Módulo 1: Cuentas y Saldos**: Completamente funcional en backend (lectura de saldos en BD, cálculo de sobregiros) y frontend.
* **Módulo 2: Transacciones e Historial**: Funcional, incluye transferencias entre cuentas y filtros por mes y año con consulta local.
* **Módulo 3: Préstamos**: Lógica transaccional ACID en base de datos implementada, con soporte para aprobación automática e intereses por mora, integrada en la UI.
* **Módulo 4: Finanzas Personales / Presupuestos**: Pendiente de desarrollo en el backend. Actualmente funciona en el frontend mediante datos estáticos (mock) y gráficas locales con recharts.

## 3. Tarea Exacta
* **Diseño Arquitectónico**: Estructurar las especificaciones y modelos de datos relacionales (MySQL) y no relacionales (MongoDB) para los módulos del sistema.
* **Planificación**: Crear una lista secuencial y ordenada de tareas para guiar el desarrollo de las integraciones pendientes de forma limpia y robusta.

## 4. Restricciones Tecnológicas
* **Stack**: MERN adaptado (MySQL como base transaccional principal + MongoDB para almacenamiento flexible y alto volumen, Express.js en backend, React.js en frontend y Node.js de runtime).
* **Entorno Estrictamente Local**: El flujo de desarrollo debe ejecutarse 100% en la máquina local (localhost). Queda totalmente prohibido el uso de repositorios remotos en la nube o hosting de datos externos hasta la culminación definitiva de la fase MVP.
