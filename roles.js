// roles.js
// Ejecutar en mongosh: mongosh ./roles.js
const adminDB = db.getSiblingDB('campus_music');

// 1) crear rol administrador (hereda dbOwner)
db.createRole({
  role: "administrador_campus",
  privileges: [],
  roles: [{ role: "dbOwner", db: "campus_music" }]
});

// 2) crear rol empleado_sede (permite find/insert/update en colecciones relevantes)
db.createRole({
  role: "empleado_sede",
  privileges: [
    { resource: { db: "campus_music", collection: "estudiantes" }, actions: ["find", "update", "insert"] },
    { resource: { db: "campus_music", collection: "inscripciones" }, actions: ["find", "insert", "update"] },
    { resource: { db: "campus_music", collection: "reservas_instrumentos" }, actions: ["find", "insert", "update"] },
    { resource: { db: "campus_music", collection: "cursos" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "instrumentos" }, actions: ["find", "update"] }
  ],
  roles: []
});

// 3) crear rol estudiante (acceso limitado)
db.createRole({
  role: "rol_estudiante",
  privileges: [
    { resource: { db: "campus_music", collection: "cursos" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "reservas_instrumentos" }, actions: ["insert", "find"] },
    { resource: { db: "campus_music", collection: "inscripciones" }, actions: ["find"] }
  ],
  roles: []
});

// 4) Crear usuarios (ejemplo admin y un empleado de sede y un estudiante)
db.createUser({
  user: "admin_campus",
  pwd: "CambiarContraSegura123!", // en producción usar secreto fuerte y vault
  roles: [ { role: "administrador_campus", db: "campus_music" } ]
});

// Usuario empleado (en la práctica crea usuarios por sede y aplicar vistas o lógica app)
db.createUser({
  user: "empleado_bogota",
  pwd: "EmpleadoPass123!",
  roles: [ { role: "empleado_sede", db: "campus_music" } ]
});

// Usuario estudiante
db.createUser({
  user: "estudiante1",
  pwd: "EstPass123!",
  roles: [ { role: "rol_estudiante", db: "campus_music" } ]
});

// 5) Vistas por sede (para lectura)
db.createView('vista_cursos_BOG', 'cursos', [
  { $match: { sede_id: sedeIds ? sedeIds[0] : null } } // en script real reemplazar por ObjectId('...')
]);
// NOTA: crear vistas dinámicamente por sede con su ObjectId real y luego
// otorgar acceso de solo lectura a la vista al usuario de la sede si quieres restringir lectura.
print('roles.js: roles y usuarios creados (ajusta contraseñas y vistas).');
