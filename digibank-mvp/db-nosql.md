# Arquitectura de Base de Datos NoSQL (MongoDB)

Este documento detalla el diseño de la base de datos no relacional para DigiBank MVP utilizando MongoDB. Su propósito es almacenar logs de alto volumen, datos de foros colaborativos y configuraciones altamente flexibles de presupuestos.

---

## 1. Diseño de Colecciones y Documentos

### Colección: `presupuestos`
Almacena las configuraciones de límites de gastos mensuales personalizables por cada usuario.
```json
{
  "_id": "ObjectId",
  "id_usuario": 12,
  "mes_anio": "2026-07",
  "categorias": [
    {
      "nombre": "Restaurantes",
      "limite": 300.00,
      "color": "#00A4E0",
      "icono": "Utensils"
    },
    {
      "nombre": "Tiendas por Departamentos",
      "limite": 150.00,
      "color": "#F59E0B",
      "icono": "ShoppingBag"
    },
    {
      "nombre": "Transferencias y Pagos",
      "limite": 50.00,
      "color": "#10B981",
      "icono": "Send"
    }
  ],
  "fecha_actualizacion": "2026-07-05T00:25:00Z"
}
```

### Colección: `audit_logs`
Almacena todas las acciones críticas realizadas por los usuarios o administradores para propósitos de auditoría y cumplimiento regulatorio.
```json
{
  "_id": "ObjectId",
  "id_usuario": 12,
  "rol": "CLIENTE",
  "accion": "PAGO_PRESTAMO",
  "detalles": {
    "id_prestamo": 3,
    "monto_pagado": 110.25,
    "interes_retraso": 5.25,
    "numero_referencia": "PAY-1783192285"
  },
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "timestamp": "2026-07-05T05:46:00Z"
}
```

### Colección: `foro_posts`
Almacena publicaciones y comentarios anidados en el foro interactivo.
```json
{
  "_id": "ObjectId",
  "autor": {
    "id_usuario": 12,
    "username": "carlos_bi"
  },
  "titulo": "¿Cómo configurar alertas de mora?",
  "contenido": "Hola, ¿alguien sabe si se pueden configurar mensajes de texto para las cuotas?",
  "categoria": "Ayuda Técnica",
  "comentarios": [
    {
      "_id": "ObjectId",
      "id_usuario": 5,
      "username": "admin_soporte",
      "comentario": "Hola Carlos, actualmente puedes ver las alertas directamente en el panel de Finanzas Personales.",
      "fecha": "2026-07-05T06:12:00Z"
    }
  ],
  "fecha_creacion": "2026-07-05T06:00:00Z"
}
```

---

## 2. Índices Recomendados

1. **Colección `presupuestos`**:
   * `{ id_usuario: 1, mes_anio: 1 }` (Índice Compuesto Único)
   * *Propósito*: Optimizar la consulta del presupuesto de un mes específico por usuario y prevenir duplicados.

2. **Colección `audit_logs`**:
   * `{ timestamp: -1 }` (Orden descendente)
   * `{ id_usuario: 1 }` (Filtro por usuario)
   * *Propósito*: Acelerar la paginación de logs del panel de administración en reversa.

3. **Colección `foro_posts`**:
   * `{ fecha_creacion: -1 }`
   * `{ "autor.id_usuario": 1 }`
   * *Propósito*: Mostrar las publicaciones más recientes del foro de soporte de manera eficiente.

---

## 3. Justificación Arquitectónica (MongoDB)

1. **Flexibilidad del Esquema**: El foro y los presupuestos manejan estructuras jerárquicas naturales (comentarios anidados dentro de publicaciones, arrays de categorías cambiantes con sus colores/iconos correspondientes). Almacenar esto en MongoDB mediante documentos JSON/BSON elimina la necesidad de realizar múltiples JOINs costosos en MySQL.
2. **Escalabilidad de Logs**: Los logs de auditoría son de tipo **Append-Only** (solo inserción, nunca edición) y crecen a un volumen exponencial en plataformas bancarias. MongoDB escala horizontalmente de manera óptima y maneja inserciones de alta frecuencia a una velocidad superior a las bases relacionales.
3. **Persistencia Desacoplada**: Almacenar las configuraciones de presupuestos del cliente fuera de la base de datos relacional garantiza que el rendimiento del núcleo transaccional principal (MySQL) no se degrade por consultas analíticas del usuario.
