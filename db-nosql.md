# Diseño de Base de Datos No Relacional: MongoDB

Este documento detalla la estructura lógica de la base de datos documental (NoSQL) de DigiBank MVP para MongoDB 6.x. MongoDB se utiliza de forma exclusiva para soportar la sección de Foro de interacción en tiempo real, garantizando una alta concurrencia y baja latencia.

---

## 1. Justificación de Escalabilidad y Alta Concurrencia
* **Desnormalización Estratégica:** A diferencia de MySQL, donde priorizamos 3NF, en MongoDB se aplica una desnormalización controlada. Guardamos campos como `nombre_usuario` y `avatar_url` directamente en el documento del mensaje del foro. Esto evita realizar operaciones de tipo `JOIN` o búsquedas adicionales en MySQL por cada mensaje renderizado, reduciendo la carga en la base de datos relacional y acelerando la lectura.
* **Modelo Orientado a Lectura:** El foro bancario tiene una tasa de lectura (lectura de la línea de tiempo) significativamente mayor que de escritura. Diseñar los documentos autocontenidos y pre-indexados permite a MongoDB responder solicitudes concurrentes en microsegundos sirviendo los datos directamente desde la memoria RAM.
* **Integración con WebSockets:** Al acoplar el foro con Socket.io en el backend, la naturaleza asíncrona y basada en JSON de MongoDB permite persistir los mensajes de forma directa sin serialización o mapeos complejos.

---

## 2. Colección: `mensajes_foro`
Esta colección contiene las publicaciones realizadas por los clientes en la comunidad en tiempo real.

### Estructura del Documento
* **_id** (ObjectId): Identificador único del documento autogenerado por MongoDB.
* **id_usuario** (Number): ID numérico del usuario en MySQL. Esto actúa como la clave externa lógica para trazabilidad administrativa.
* **nombre_usuario** (String): Nombre descriptivo desnormalizado del usuario (nombres y primer apellido) al momento de publicar.
* **avatar_url** (String): URL del avatar o foto de perfil de Google OAuth (Firebase Auth) del usuario.
* **mensaje** (String): Contenido de texto del mensaje publicado (máximo 1000 caracteres).
* **timestamp** (Date): Fecha y hora en que se creó el mensaje (por defecto la fecha del servidor).
* **editado** (Boolean): Bandera para indicar si el usuario modificó la publicación.
* **fecha_edicion** (Date): Fecha de última modificación (nulo por defecto).

---

## 3. Índices Recomendados
Para soportar lecturas ultrarrápidas y ordenamiento eficiente sin sobrecargar la CPU del servidor MongoDB:

1. **Índice en `timestamp` (Descendente):**
   * **Propósito:** El foro muestra siempre los mensajes más recientes al inicio (orden cronológico inverso). Este índice permite realizar búsquedas con ordenamientos de tipo `.sort({ timestamp: -1 })` de manera inmediata sin requerir ordenamiento en memoria.
2. **Índice en `id_usuario` (Ascendente):**
   * **Propósito:** Permite buscar y agrupar de manera rápida todos los comentarios realizados por un usuario específico para fines de control de spam, reportes o auditoría interna.
3. **Índice Compuesto en `(timestamp, id_usuario)` (Opcional):**
   * **Propósito:** Optimiza el filtrado concurrente de la línea de tiempo cuando se realizan búsquedas combinadas.
