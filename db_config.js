// db_config.js
// Ejecutar en mongosh: mongosh ./db_config.js
const db = db.getSiblingDB('campus_music');

// BORRAR si existen (útil durante desarrollo)
// db.dropDatabase();

// 1) sedes
db.createCollection('sedes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['codigo','ciudad','direccion','capacidad'],
      properties: {
        codigo: { bsonType: 'string' },
        ciudad: { bsonType: 'string' },
        direccion: { bsonType: 'string' },
        capacidad: { bsonType: 'int', minimum: 1 },
        cursos_disponibles: { bsonType: 'array', items: { bsonType: 'objectId' } }
      }
    }
  }
});
db.sedes.createIndex({ codigo: 1 }, { unique: true });

// 2) profesores
db.createCollection('profesores', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['documento','nombre','especialidades'],
      properties: {
        documento: { bsonType: 'string' },
        nombre: { bsonType: 'string' },
        contacto: { bsonType: 'object', properties: { email: {bsonType:'string'}, telefono:{bsonType:'string'} } },
        especialidades: { bsonType: 'array', items: { bsonType: 'string' } },
        experiencia_anios: { bsonType: 'int', minimum: 0 },
        cursos_asignados: { bsonType: 'array', items: { bsonType: 'objectId' } }
      }
    }
  }
});
db.profesores.createIndex({ documento: 1 }, { unique: true });

// 3) estudiantes
db.createCollection('estudiantes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['documento','nombre','nivel'],
      properties: {
        documento: { bsonType: 'string' },
        nombre: { bsonType: 'string' },
        contacto: { bsonType: 'object', properties: { email: {bsonType:'string'}, telefono:{bsonType:'string'} } },
        nivel: { enum: ['Básico','Intermedio','Avanzado'] },
        fechaRegistro: { bsonType: 'date' }
      }
    }
  }
});
db.estudiantes.createIndex({ documento: 1 }, { unique: true });
db.estudiantes.createIndex({ 'contacto.email': 1 }, { unique: true, sparse: true });

// 4) cursos
db.createCollection('cursos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['codigo','nombre','instrumento','nivel','cupos_totales','cupos_disponibles','sede_id','costo'],
      properties: {
        codigo: { bsonType: 'string' },
        nombre: { bsonType: 'string' },
        instrumento: { bsonType: 'string' },
        nivel: { enum: ['Básico','Intermedio','Avanzado'] },
        duracion_semanas: { bsonType: 'int', minimum: 1 },
        cupos_totales: { bsonType: 'int', minimum: 0 },
        cupos_disponibles: { bsonType: 'int', minimum: 0 },
        horario: { 
          bsonType: 'object',
          properties: {
            dias: { bsonType: 'array', items: { bsonType: 'string' } },
            horaInicio: { bsonType: 'string' }, // e.g., '17:00'
            horaFin: { bsonType: 'string' }
          }
        },
        sede_id: { bsonType: 'objectId' },
        profesor_id: { bsonType: 'objectId' },
        fechaInicio: { bsonType: 'date' },
        fechaFin: { bsonType: 'date' },
        costo: { bsonType: 'double' },
        activo: { bsonType: 'bool' }
      }
    }
  }
});
db.cursos.createIndex({ codigo: 1 }, { unique: true });
db.cursos.createIndex({ sede_id: 1, instrumento: 1 });
db.cursos.createIndex({ profesor_id: 1 });

// 5) inscripciones
db.createCollection('inscripciones', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['estudiante_id','curso_id','sede_id','fechaInscripcion','costo'],
      properties: {
        estudiante_id: { bsonType: 'objectId' },
        curso_id: { bsonType: 'objectId' },
        sede_id: { bsonType: 'objectId' },
        profesor_id: { bsonType: 'objectId' },
        fechaInscripcion: { bsonType: 'date' },
        costo: { bsonType: 'double' },
        estadoPago: { enum: ['Pendiente','Pagado','Parcial'], bsonType: 'string' }
      }
    }
  }
});
db.inscripciones.createIndex({ estudiante_id: 1 });
db.inscripciones.createIndex({ curso_id: 1 });
db.inscripciones.createIndex({ sede_id: 1 });
db.inscripciones.createIndex({ fechaInscripcion: -1 });

// 6) instrumentos
db.createCollection('instrumentos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tipo','codigo','disponible','sede_id'],
      properties: {
        codigo: { bsonType: 'string' },
        tipo: { bsonType: 'string' }, // e.g., Piano, Guitarra
        marca: { bsonType: 'string' },
        disponible: { bsonType: 'bool' },
        sede_id: { bsonType: 'objectId' },
        detalles: { bsonType: 'object' }
      }
    }
  }
});
db.instrumentos.createIndex({ codigo: 1 }, { unique: true });
db.instrumentos.createIndex({ tipo: 1 });

// 7) reservas_instrumentos
db.createCollection('reservas_instrumentos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['instrumento_id','estudiante_id','fechaReserva','estado'],
      properties: {
        instrumento_id: { bsonType: 'objectId' },
        estudiante_id: { bsonType: 'objectId' },
        fechaReserva: { bsonType: 'date' },
        fechaFin: { bsonType: 'date' },
        estado: { enum: ['Activa','Cancelada','Finalizada'] },
        notas: { bsonType: 'string' }
      }
    }
  }
});
db.reservas_instrumentos.createIndex({ instrumento_id: 1 });
db.reservas_instrumentos.createIndex({ estudiante_id: 1 });

// 8) usuarios (para administración / login)
db.createCollection('usuarios', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username','role'],
      properties: {
        username: { bsonType: 'string' },
        passwordHash: { bsonType: 'string' }, // almacena hash (bcrypt) en app, no contraseña en claro
        role: { bsonType: 'string' }, // e.g., Administrador, EmpleadoSede, Estudiante
        persona_ref: { bsonType: 'object' }, // referencia a estudiante/profesor (por seguridad manejar en app)
        sede_id: { bsonType: ['objectId','null'] }
      }
    }
  }
});
db.usuarios.createIndex({ username: 1 }, { unique: true });

print('db_config.js: colecciones y índices creados correctamente.');
