// db_config.js - Configuración de la base de datos Campus Music
// Este archivo crea todas las colecciones con validación $jsonSchema e índices

use('campus_music');

// 1. COLECCIÓN USUARIOS
db.createCollection('usuarios', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para usuarios',
      required: ['nombre', 'email', 'password', 'rol', 'fechaCreacion'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'Nombre completo del usuario'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email válido del usuario'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Contraseña del usuario (mínimo 8 caracteres)'
        },
        rol: {
          bsonType: 'string',
          enum: ['administrador', 'empleado_sede', 'estudiante'],
          description: 'Rol del usuario en el sistema'
        },
        sedeAsignada: {
          bsonType: 'objectId',
          description: 'ID de la sede asignada (solo para empleados)'
        },
        activo: {
          bsonType: 'bool',
          description: 'Estado activo/inactivo del usuario'
        },
        fechaCreacion: {
          bsonType: 'date',
          description: 'Fecha de creación del usuario'
        }
      }
    }
  }
});

// 2. COLECCIÓN SEDES
db.createCollection('sedes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para sedes',
      required: ['nombre', 'ciudad', 'direccion', 'capacidad', 'fechaCreacion'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'Nombre de la sede'
        },
        ciudad: {
          bsonType: 'string',
          enum: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'],
          description: 'Ciudad donde se ubica la sede'
        },
        direccion: {
          bsonType: 'string',
          description: 'Dirección física de la sede'
        },
        telefono: {
          bsonType: 'string',
          description: 'Teléfono de contacto de la sede'
        },
        capacidad: {
          bsonType: 'int',
          minimum: 1,
          description: 'Capacidad total de estudiantes de la sede'
        },
        activa: {
          bsonType: 'bool',
          description: 'Estado activo/inactivo de la sede'
        },
        fechaCreacion: {
          bsonType: 'date',
          description: 'Fecha de creación de la sede'
        }
      }
    }
  }
});

// 3. COLECCIÓN PROFESORES
db.createCollection('profesores', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para profesores',
      required: ['nombre', 'documento', 'especialidades', 'experiencia', 'fechaIngreso'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'Nombre completo del profesor'
        },
        documento: {
          bsonType: 'string',
          description: 'Documento de identidad del profesor'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email del profesor'
        },
        telefono: {
          bsonType: 'string',
          description: 'Teléfono del profesor'
        },
        especialidades: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
            enum: ['Piano', 'Guitarra', 'Violin', 'Bateria', 'Canto', 'Teoria_Musical', 'Bajo', 'Flauta']
          },
          description: 'Instrumentos o áreas que enseña el profesor'
        },
        experiencia: {
          bsonType: 'int',
          minimum: 0,
          description: 'Años de experiencia del profesor'
        },
        sedesAsignadas: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          },
          description: 'IDs de las sedes donde enseña el profesor'
        },
        activo: {
          bsonType: 'bool',
          description: 'Estado activo/inactivo del profesor'
        },
        fechaIngreso: {
          bsonType: 'date',
          description: 'Fecha de ingreso del profesor'
        }
      }
    }
  }
});

// 4. COLECCIÓN ESTUDIANTES
db.createCollection('estudiantes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para estudiantes',
      required: ['nombre', 'documento', 'email', 'nivelMusical', 'fechaRegistro'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'Nombre completo del estudiante'
        },
        documento: {
          bsonType: 'string',
          description: 'Documento de identidad del estudiante'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email del estudiante'
        },
        telefono: {
          bsonType: 'string',
          description: 'Teléfono del estudiante'
        },
        fechaNacimiento: {
          bsonType: 'date',
          description: 'Fecha de nacimiento del estudiante'
        },
        nivelMusical: {
          bsonType: 'string',
          enum: ['Basico', 'Intermedio', 'Avanzado'],
          description: 'Nivel musical del estudiante'
        },
        contactoEmergencia: {
          bsonType: 'object',
          properties: {
            nombre: { bsonType: 'string' },
            telefono: { bsonType: 'string' },
            relacion: { bsonType: 'string' }
          }
        },
        activo: {
          bsonType: 'bool',
          description: 'Estado activo/inactivo del estudiante'
        },
        fechaRegistro: {
          bsonType: 'date',
          description: 'Fecha de registro del estudiante'
        }
      }
    }
  }
});

// 5. COLECCIÓN CURSOS
db.createCollection('cursos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para cursos',
      required: ['nombre', 'instrumento', 'nivel', 'duracion', 'cupoMaximo', 'cuposDisponibles', 'costo', 'sede', 'profesor'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'Nombre del curso'
        },
        instrumento: {
          bsonType: 'string',
          enum: ['Piano', 'Guitarra', 'Violin', 'Bateria', 'Canto', 'Teoria_Musical', 'Bajo', 'Flauta'],
          description: 'Instrumento principal del curso'
        },
        nivel: {
          bsonType: 'string',
          enum: ['Basico', 'Intermedio', 'Avanzado'],
          description: 'Nivel del curso'
        },
        duracion: {
          bsonType: 'int',
          minimum: 1,
          description: 'Duración del curso en semanas'
        },
        cupoMaximo: {
          bsonType: 'int',
          minimum: 1,
          description: 'Cupo máximo de estudiantes'
        },
        cuposDisponibles: {
          bsonType: 'int',
          minimum: 0,
          description: 'Cupos actualmente disponibles'
        },
        costo: {
          bsonType: 'double',
          minimum: 0,
          description: 'Costo del curso en pesos colombianos'
        },
        horario: {
          bsonType: 'object',
          properties: {
            dias: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
                enum: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
              }
            },
            horaInicio: { bsonType: 'string' },
            horaFin: { bsonType: 'string' }
          }
        },
        sede: {
          bsonType: 'objectId',
          description: 'ID de la sede donde se dicta el curso'
        },
        profesor: {
          bsonType: 'objectId',
          description: 'ID del profesor asignado al curso'
        },
        fechaInicio: {
          bsonType: 'date',
          description: 'Fecha de inicio del curso'
        },
        fechaFin: {
          bsonType: 'date',
          description: 'Fecha de finalización del curso'
        },
        activo: {
          bsonType: 'bool',
          description: 'Estado activo/inactivo del curso'
        }
      }
    }
  }
});

// 6. COLECCIÓN INSCRIPCIONES
db.createCollection('inscripciones', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para inscripciones',
      required: ['estudiante', 'curso', 'sede', 'fechaInscripcion', 'costo', 'estado'],
      properties: {
        estudiante: {
          bsonType: 'objectId',
          description: 'ID del estudiante inscrito'
        },
        curso: {
          bsonType: 'objectId',
          description: 'ID del curso'
        },
        sede: {
          bsonType: 'objectId',
          description: 'ID de la sede'
        },
        profesor: {
          bsonType: 'objectId',
          description: 'ID del profesor asignado'
        },
        fechaInscripcion: {
          bsonType: 'date',
          description: 'Fecha de inscripción'
        },
        costo: {
          bsonType: 'double',
          minimum: 0,
          description: 'Costo pagado por la inscripción'
        },
        estado: {
          bsonType: 'string',
          enum: ['Activa', 'Completada', 'Cancelada'],
          description: 'Estado actual de la inscripción'
        },
        fechaFinalizacion: {
          bsonType: 'date',
          description: 'Fecha de finalización del curso'
        },
        calificacionFinal: {
          bsonType: 'double',
          minimum: 0,
          maximum: 5,
          description: 'Calificación final del estudiante'
        }
      }
    }
  }
});

// 7. COLECCIÓN INSTRUMENTOS
db.createCollection('instrumentos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para instrumentos',
      required: ['nombre', 'tipo', 'marca', 'estado', 'sede'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'Nombre identificador del instrumento'
        },
        tipo: {
          bsonType: 'string',
          enum: ['Piano', 'Guitarra', 'Violin', 'Bateria', 'Bajo', 'Flauta', 'Teclado'],
          description: 'Tipo de instrumento'
        },
        marca: {
          bsonType: 'string',
          description: 'Marca del instrumento'
        },
        modelo: {
          bsonType: 'string',
          description: 'Modelo del instrumento'
        },
        numeroSerie: {
          bsonType: 'string',
          description: 'Número de serie del instrumento'
        },
        estado: {
          bsonType: 'string',
          enum: ['Disponible', 'Reservado', 'En_Mantenimiento', 'Fuera_de_Servicio'],
          description: 'Estado actual del instrumento'
        },
        sede: {
          bsonType: 'objectId',
          description: 'ID de la sede donde se encuentra el instrumento'
        },
        fechaAdquisicion: {
          bsonType: 'date',
          description: 'Fecha de adquisición del instrumento'
        },
        valorComercial: {
          bsonType: 'double',
          minimum: 0,
          description: 'Valor comercial del instrumento'
        }
      }
    }
  }
});

// 8. COLECCIÓN RESERVAS_INSTRUMENTOS
db.createCollection('reservas_instrumentos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title: 'Schema de validación para reservas de instrumentos',
      required: ['estudiante', 'instrumento', 'fechaReserva', 'fechaInicio', 'fechaFin', 'estado'],
      properties: {
        estudiante: {
          bsonType: 'objectId',
          description: 'ID del estudiante que reserva'
        },
        instrumento: {
          bsonType: 'objectId',
          description: 'ID del instrumento reservado'
        },
        fechaReserva: {
          bsonType: 'date',
          description: 'Fecha en que se realizó la reserva'
        },
        fechaInicio: {
          bsonType: 'date',
          description: 'Fecha de inicio de la reserva'
        },
        fechaFin: {
          bsonType: 'date',
          description: 'Fecha de finalización de la reserva'
        },
        estado: {
          bsonType: 'string',
          enum: ['Pendiente', 'Activa', 'Finalizada', 'Cancelada'],
          description: 'Estado actual de la reserva'
        },
        observaciones: {
          bsonType: 'string',
          description: 'Observaciones adicionales sobre la reserva'
        }
      }
    }
  }
});

// CREACIÓN DE ÍNDICES

// Índices para usuarios
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.usuarios.createIndex({ rol: 1 });
db.usuarios.createIndex({ sedeAsignada: 1 });

// Índices para sedes
db.sedes.createIndex({ ciudad: 1 });
db.sedes.createIndex({ nombre: 1 }, { unique: true });

// Índices para profesores
db.profesores.createIndex({ documento: 1 }, { unique: true });
db.profesores.createIndex({ email: 1 }, { unique: true });
db.profesores.createIndex({ especialidades: 1 });
db.profesores.createIndex({ sedesAsignadas: 1 });

// Índices para estudiantes
db.estudiantes.createIndex({ documento: 1 }, { unique: true });
db.estudiantes.createIndex({ email: 1 }, { unique: true });
db.estudiantes.createIndex({ nivelMusical: 1 });

// Índices para cursos
db.cursos.createIndex({ sede: 1, instrumento: 1 });
db.cursos.createIndex({ profesor: 1 });
db.cursos.createIndex({ nivel: 1 });
db.cursos.createIndex({ fechaInicio: 1, fechaFin: 1 });
db.cursos.createIndex({ activo: 1 });

// Índices para inscripciones
db.inscripciones.createIndex({ estudiante: 1 });
db.inscripciones.createIndex({ curso: 1 });
db.inscripciones.createIndex({ sede: 1 });
db.inscripciones.createIndex({ fechaInscripcion: 1 });
db.inscripciones.createIndex({ estado: 1 });
db.inscripciones.createIndex({ estudiante: 1, fechaInscripcion: -1 });

// Índices para instrumentos
db.instrumentos.createIndex({ tipo: 1, sede: 1 });
db.instrumentos.createIndex({ estado: 1 });
db.instrumentos.createIndex({ numeroSerie: 1 }, { unique: true, sparse: true });

// Índices para reservas_instrumentos
db.reservas_instrumentos.createIndex({ estudiante: 1 });
db.reservas_instrumentos.createIndex({ instrumento: 1 });
db.reservas_instrumentos.createIndex({ estado: 1 });
db.reservas_instrumentos.createIndex({ fechaInicio: 1, fechaFin: 1 });

print('✅ Base de datos Campus Music configurada exitosamente');
print('✅ Colecciones creadas con validación $jsonSchema');
print('✅ Índices creados para optimizar consultas');