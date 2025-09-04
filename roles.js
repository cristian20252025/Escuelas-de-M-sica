// roles.js

// --- Crear Rol de Administrador ---
db.createRole({
  role: "rolAdministrador",
  privileges: [
    { resource: { db: "campus_music", collection: "" }, actions: ["find", "insert", "update", "remove", "createCollection", "dropCollection", "indexDetails"] },
    { resource: { db: "campus_music", collection: "usuarios" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "sedes" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "profesores" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "estudiantes" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "cursos" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "inscripciones" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "instrumentos" }, actions: ["find", "insert", "update", "remove"] },
    { resource: { db: "campus_music", collection: "reservas_instrumentos" }, actions: ["find", "insert", "update", "remove"] }
  ],
  roles: []
});

// --- Crear Rol de Empleado de sede ---
db.createRole({
  role: "rolEmpleadoSede",
  privileges: [
    { resource: { db: "campus_music", collection: "usuarios" }, actions: ["find", "update"] },
    { resource: { db: "campus_music", collection: "sedes" }, actions: ["find", "update"] },
    { resource: { db: "campus_music", collection: "cursos" }, actions: ["find", "insert", "update"] },
    { resource: { db: "campus_music", collection: "inscripciones" }, actions: ["find", "insert"] },
    { resource: { db: "campus_music", collection: "profesores" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "estudiantes" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "instrumentos" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "reservas_instrumentos" }, actions: ["find", "insert"] }
  ],
  roles: []
});

// --- Crear Rol de Estudiante ---
db.createRole({
  role: "rolEstudiante",
  privileges: [
    { resource: { db: "campus_music", collection: "estudiantes" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "inscripciones" }, actions: ["find", "insert"] },
    { resource: { db: "campus_music", collection: "instrumentos" }, actions: ["find"] },
    { resource: { db: "campus_music", collection: "reservas_instrumentos" }, actions: ["find", "insert"] }
  ],
  roles: []
});

// --- Asignar roles a usuarios existentes ---
/*
Ejemplo: si tienes usuarios creados con nombres "adminUser", "empleadoBogota", "estudiante1"
después de crear los roles, asigna roles así:
*/
try {
  db.grantRolesToUser("adminUser", [{ role: "rolAdministrador", db: "campus_music" }]);
  db.grantRolesToUser("empleadoBogota", [{ role: "rolEmpleadoSede", db: "campus_music" }]);
  db.grantRolesToUser("estudiante1", [{ role: "rolEstudiante", db: "campus_music" }]);
} catch (e) {
  print("Error asignando roles: " + e);
}

// --- Nota: Para crear usuarios y asignar roles, usar createUser() y grantRolesToUser() en tu entorno de administración ---