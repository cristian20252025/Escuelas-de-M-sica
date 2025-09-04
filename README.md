Claro, aquí tienes un ejemplo completo y organizado del archivo `README.md` para tu proyecto, que explica cada sección en detalle, incluyendo la justificación técnica, estructura del modelo, poblamiento de datos, roles, transacciones y consultas analíticas.

---

# Proyecto: Sistema de Gestión de Escuelas de Música - Campus Music

## Introducción al proyecto

Este proyecto consiste en la migración y desarrollo de un sistema de gestión para múltiples escuelas de música, actualmente basado en hojas de cálculo, con el objetivo de mejorar la eficiencia, la integridad de datos y la capacidad analítica. Se implementa sobre MongoDB, aprovechando su flexibilidad, esquema flexible y capacidades transaccionales para gestionar estudiantes, profesores, cursos, sedes, inscripciones, instrumentos y reservas.

---

## Justificación del uso de MongoDB

- **Flexibilidad en el esquema:** La estructura de datos puede evolucionar fácilmente sin afectar toda la base, permitiendo agregar nuevos atributos o colecciones.
- **Operaciones transaccionales:** MongoDB soporta transacciones ACID, esenciales para operaciones como inscripciones que requieren actualizar varias colecciones de manera atómica.
- **Consultas analíticas:** Capacidad de realizar agregaciones complejas para obtener métricas y reportes de negocio en tiempo real.
- **Escalabilidad:** Capacidad para manejar un volumen creciente de datos y solicitudes sin complicaciones de un esquema rígido relacional.
- **Documentos anidados y referencias:** Permite modelar relaciones entre entidades usando referencias (ObjectId) y documentos embebidos según convenga.

---

## Diseño del modelo de datos

### Colecciones creadas

| Colección | Descripción | Validaciones y esquema |
|------------|--------------|------------------------|
| `usuarios` | Usuarios del sistema (admin, empleados, estudiantes) | Validación con `$jsonSchema`, índices únicos en email y documento |
| `sedes` | Sedes físicas de las escuelas | Validación, índices en nombre y ciudad |
| `profesores` | Profesores con especialidades y experiencia | Validación, índices en documento y email |
| `estudiantes` | Estudiantes inscritos | Validación, índices en documento y email |
| `cursos` | Cursos ofrecidos | Validación, índices en sede, instrumento y nivel |
| `inscripciones` | Inscripciones de estudiantes en cursos | Validación, índices en estudiante, curso y sede |
| `instrumentos` | Instrumentos disponibles para préstamo | Validación, índices en tipo, serie y estado |
| `reservas_instrumentos` | Reservas de instrumentos por estudiantes | Validación, índices en estudiante, instrumento y estado |

### Decisiones de modelado

- **Referencias:** Se utilizan ObjectId en campos que representan relaciones entre colecciones, por ejemplo, en `inscripciones`, `cursos`, `profesores`, `sedes`, etc.
- **Validaciones:** Cada colección tiene un esquema que valida tipos de datos, campos requeridos, valores permitidos (enum), estructuras embebidas (como en `contactoEmergencia`), y reglas de negocio.
- **Índices:** Se crean para optimizar consultas frecuentes y mantener integridad en datos únicos.

---

## Estructura de los datos de prueba

El script `test_dataset.js` pobla la base con datos realistas, incluyendo:

- **3 sedes** en ciudades diferentes con capacidad y datos de contacto.
- **7 profesores** con distintas especialidades y experiencia.
- **Varias cursos** por sede, con diferentes instrumentos, niveles, duraciones y horarios.
- **15 estudiantes** con diferentes niveles y datos de contacto.
- **20 instrumentos** de diversas categorías y estados.
- **30 inscripciones** de estudiantes en cursos diversos, con fechas recientes.
- **10 reservas** de instrumentos por estudiantes.

Este conjunto de datos permite realizar pruebas e informes completos.

---

## Creación y gestión de roles

El archivo `roles.js` define roles con permisos específicos:

| Rol | Permisos | Uso |
|-------|------------|-----|
| `rolAdministrador` | Acceso total: crear, leer, actualizar, eliminar en toda la base | Para administradores del sistema |
| `rolEmpleadoSede` | Acceso limitado a sedes específicas: gestionar cursos, inscripciones, profesores y estudiantes de su sede | Para empleados encargados de sedes |
| `rolEstudiante` | Acceso a su perfil, inscripciones, reservas e información de cursos | Para estudiantes |

**Ejemplo de asignación:**

```js
db.grantRolesToUser("adminUser", [{ role: "rolAdministrador", db: "campus_music" }]);
```

---

## Transacciones en MongoDB

El archivo `transactions.js` demuestra cómo inscribir a un estudiante en un curso en forma atómica, garantizando que se actualicen correctamente las inscripciones y los cupos disponibles.

### Escenario de la transacción

1. Verificar que haya cupos disponibles en el curso.
2. Insertar la inscripción del estudiante.
3. Disminuir en uno el campo `cuposDisponibles` del curso.
4. En caso de error, hacer rollback completo.

### Código ejemplo

```js
const session = db.getMongo().startSession();
try {
  session.startTransaction();

  const dbs = session.getDatabase("campus_music");

  // IDs reales en tu entorno
  const estudianteId = ObjectId("ID_ESTUDIANTE");
  const cursoId = ObjectId("ID_CURSO");

  // Verificar cupos
  const curso = dbs.cursos.findOne({ _id: cursoId });
  if (!curso || curso.cuposDisponibles <= 0) {
    throw new Error("No hay cupos disponibles");
  }

  // Insertar inscripción
  dbs.inscripciones.insertOne({
    estudiante: estudianteId,
    curso: cursoId,
    sede: curso.sede,
    profesor: curso.profesor,
    fechaInscripcion: new Date(),
    costo: curso.costo,
    estado: "Activa"
  });

  // Actualizar cupos
  dbs.cursos.updateOne(
    { _id: cursoId, cuposDisponibles: { $gt: 0 } },
    { $inc: { cuposDisponibles: -1 } }
  );

  session.commitTransaction();
  print("Inscripción exitosa");
} catch (e) {
  print("Error: " + e);
  session.abortTransaction();
} finally {
  session.endSession();
}
```

---

## Consultas analíticas con agregaciones

El archivo `aggregations.js` contiene varias consultas para obtener métricas clave:

### Resumen de las consultas

1. **Estudiantes inscritos por sede en el último mes:** Agrupa por sede, cuenta estudiantes únicos y total de inscripciones.
2. **Cursos más demandados en cada sede:** Ranking por número de inscripciones, incluyendo porcentaje de ocupación.
3. **Ingresos totales por sede:** Suma de costos de inscripciones activas y completadas, con métricas de capacidad y aprovechamiento.
4. **Profesores con más estudiantes asignados:** Cuenta estudiantes únicos por profesor, además de cursos, sedes y ingresos generados.
5. **Instrumentos más reservados:** Agrupación por tipo, con conteo de reservas y uso.
6. **Historial de cursos de un estudiante:** Listado completo con fechas, sede, profesor, nivel y costo.
7. **Cursos en ejecución:** Cursos activos en la fecha actual con métricas de ocupación.
8. **Cursos sobrecupos:** Detecta cursos con inscripciones que exceden la capacidad máxima.

Cada consulta está explicada con comentarios y lógica para facilitar la comprensión y personalización.

---

## Conclusiones y mejoras posibles

- Integrar notificaciones automáticas para recordatorios o vencimientos.
- Implementar análisis predictivos con datos históricos.
- Mejorar la interfaz de usuario para gestionar permisos y roles.
- Optimizar índices y consultas para grandes volúmenes de datos.
- Expandir el esquema con nuevas entidades como eventos, pagos, etc.

---

## Resumen final

Este proyecto proporciona un sistema completo para gestionar y analizar la operación de múltiples escuelas de música, garantizando integridad, seguridad y capacidad de toma de decisiones basada en datos. La estructura modular y el uso de MongoDB permiten fácil mantenimiento y escalabilidad.

Realizado por: Cristian Perez