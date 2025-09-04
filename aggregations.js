// aggregations.js - Consultas analíticas con framework de agregación de MongoDB
// Este archivo resuelve preguntas de negocio usando pipeline de agregación

use('campus_music');

print('🔍 CONSULTAS ANALÍTICAS - CAMPUS MUSIC');
print('═══════════════════════════════════════════════════════════');

// 1. ¿Cuántos estudiantes se inscribieron por sede en el último mes?
print('\n1️⃣  ESTUDIANTES INSCRITOS POR SEDE EN EL ÚLTIMO MES');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Filtra inscripciones del último mes
- Agrupa por sede
- Une con información de la sede para obtener el nombre
- Cuenta estudiantes únicos por sede
*/
db.inscripciones.aggregate([
  {
    $match: {
      fechaInscripcion: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      }
    }
  },
  {
    $group: {
      _id: "$sede",
      estudiantesInscritos: { $addToSet: "$estudiante" },
      totalInscripciones: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "sedes",
      localField: "_id",
      foreignField: "_id",
      as: "sedeInfo"
    }
  },
  {
    $unwind: "$sedeInfo"
  },
  {
    $project: {
      _id: 0,
      sede: "$sedeInfo.nombre",
      ciudad: "$sedeInfo.ciudad",
      estudiantesUnicos: { $size: "$estudiantesInscritos" },
      totalInscripciones: 1
    }
  },
  {
    $sort: { estudiantesUnicos: -1 }
  }
]).forEach(printjson);

// 2. ¿Cuáles son los cursos más demandados en cada sede?
print('\n2️⃣  CURSOS MÁS DEMANDADOS POR SEDE');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Agrupa inscripciones por sede y curso
- Cuenta inscripciones por curso
- Usa $group con $push para crear ranking por sede
- Ordena cursos por demanda dentro de cada sede
*/
db.inscripciones.aggregate([
  {
    $group: {
      _id: {
        sede: "$sede",
        curso: "$curso"
      },
      totalInscripciones: { $sum: 1 },
      estudiantesActivos: {
        $sum: {
          $cond: [{ $eq: ["$estado", "Activa"] }, 1, 0]
        }
      }
    }
  },
  {
    $lookup: {
      from: "cursos",
      localField: "_id.curso",
      foreignField: "_id",
      as: "cursoInfo"
    }
  },
  {
    $lookup: {
      from: "sedes",
      localField: "_id.sede",
      foreignField: "_id",
      as: "sedeInfo"
    }
  },
  {
    $unwind: "$cursoInfo"
  },
  {
    $unwind: "$sedeInfo"
  },
  {
    $sort: { "_id.sede": 1, "totalInscripciones": -1 }
  },
  {
    $group: {
      _id: "$_id.sede",
      sede: { $first: "$sedeInfo.nombre" },
      ciudad: { $first: "$sedeInfo.ciudad" },
      cursos: {
        $push: {
          curso: "$cursoInfo.nombre",
          instrumento: "$cursoInfo.instrumento",
          nivel: "$cursoInfo.nivel",
          totalInscripciones: "$totalInscripciones",
          estudiantesActivos: "$estudiantesActivos",
          ocupacion: {
            $round: [
              { $multiply: [
                { $divide: ["$totalInscripciones", "$cursoInfo.cupoMaximo"] },
                100
              ]}, 2
            ]
          }
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      sede: 1,
      ciudad: 1,
      cursosMasDemandados: { $slice: ["$cursos", 3] },
      totalCursos: { $size: "$cursos" }
    }
  }
]).forEach(printjson);

// 3. ¿Cuál es el ingreso total generado por inscripciones en cada sede?
print('\n3️⃣  INGRESOS POR INSCRIPCIONES POR SEDE');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Filtra solo inscripciones activas y completadas
- Agrupa por sede sumando costos
- Calcula métricas financieras adicionales
- Incluye información de capacidad y aprovechamiento
*/
db.inscripciones.aggregate([
  {
    $match: {
      estado: { $in: ["Activa", "Completada"] }
    }
  },
  {
    $group: {
      _id: "$sede",
      ingresoTotal: { $sum: "$costo" },
      inscripcionesActivas: {
        $sum: { $cond: [{ $eq: ["$estado", "Activa"] }, 1, 0] }
      },
      inscripcionesCompletadas: {
        $sum: { $cond: [{ $eq: ["$estado", "Completada"] }, 1, 0] }
      },
      costoPromedio: { $avg: "$costo" },
      totalInscripciones: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "sedes",
      localField: "_id",
      foreignField: "_id",
      as: "sedeInfo"
    }
  },
  {
    $unwind: "$sedeInfo"
  },
  {
    $project: {
      _id: 0,
      sede: "$sedeInfo.nombre",
      ciudad: "$sedeInfo.ciudad",
      capacidad: "$sedeInfo.capacidad",
      ingresoTotal: { $round: ["$ingresoTotal", 2] },
      costoPromedio: { $round: ["$costoPromedio", 2] },
      inscripcionesActivas: 1,
      inscripcionesCompletadas: 1,
      totalInscripciones: 1,
      aprovechamientoCapacidad: {
        $round: [
          { $multiply: [
            { $divide: ["$totalInscripciones", "$sedeInfo.capacidad"] },
            100
          ]}, 2
        ]
      }
    }
  },
  {
    $sort: { ingresoTotal: -1 }
  }
]).forEach(printjson);

// 4. ¿Qué profesor tiene más estudiantes asignados?
print('\n4️⃣  PROFESORES CON MÁS ESTUDIANTES ASIGNADOS');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Agrupa inscripciones activas por profesor
- Cuenta estudiantes únicos por profesor
- Une con información del profesor
- Incluye métricas de cursos y sedes asignadas
*/
db.inscripciones.aggregate([
  {
    $match: { estado: "Activa" }
  },
  {
    $group: {
      _id: "$profesor",
      estudiantesUnicos: { $addToSet: "$estudiante" },
      cursosAsignados: { $addToSet: "$curso" },
      sedesAtendidas: { $addToSet: "$sede" },
      ingresoGenerado: { $sum: "$costo" }
    }
  },
  {
    $lookup: {
      from: "profesores",
      localField: "_id",
      foreignField: "_id",
      as: "profesorInfo"
    }
  },
  {
    $unwind: "$profesorInfo"
  },
  {
    $project: {
      _id: 0,
      profesor: "$profesorInfo.nombre",
      email: "$profesorInfo.email",
      especialidades: "$profesorInfo.especialidades",
      experiencia: "$profesorInfo.experiencia",
      totalEstudiantes: { $size: "$estudiantesUnicos" },
      totalCursos: { $size: "$cursosAsignados" },
      totalSedes: { $size: "$sedesAtendidas" },
      ingresoGenerado: { $round: ["$ingresoGenerado", 2] },
      promedioEstudiantesPorCurso: {
        $round: [
          { $divide: [
            { $size: "$estudiantesUnicos" },
            { $size: "$cursosAsignados" }
          ]}, 2
        ]
      }
    }
  },
  {
    $sort: { totalEstudiantes: -1 }
  },
  {
    $limit: 10
  }
]).forEach(printjson);

// 5. ¿Qué instrumento es el más reservado?
print('\n5️⃣  INSTRUMENTOS MÁS RESERVADOS');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Une reservas con información de instrumentos
- Agrupa por tipo de instrumento
- Cuenta total de reservas y calcula métricas de uso
- Incluye información de disponibilidad actual
*/
db.reservas_instrumentos.aggregate([
  {
    $lookup: {
      from: "instrumentos",
      localField: "instrumento",
      foreignField: "_id",
      as: "instrumentoInfo"
    }
  },
  {
    $unwind: "$instrumentoInfo"
  },
  {
    $group: {
      _id: "$instrumentoInfo.tipo",
      totalReservas: { $sum: 1 },
      reservasActivas: {
        $sum: { $cond: [{ $eq: ["$estado", "Activa"] }, 1, 0] }
      },
      reservasFinalizadas: {
        $sum: { $cond: [{ $eq: ["$estado", "Finalizada"] }, 1, 0] }
      },
      reservasCanceladas: {
        $sum: { $cond: [{ $eq: ["$estado", "Cancelada"] }, 1, 0] }
      },
      instrumentosReservados: { $addToSet: "$instrumento" }
    }
  },
  {
    $lookup: {
      from: "instrumentos",
      let: { tipoInstrumento: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$tipo", "$$tipoInstrumento"] } } },
        {
          $group: {
            _id: null,
            totalInstrumentos: { $sum: 1 },
            disponibles: {
              $sum: { $cond: [{ $eq: ["$estado", "Disponible"] }, 1, 0] }
            },
            reservados: {
              $sum: { $cond: [{ $eq: ["$estado", "Reservado"] }, 1, 0] }
            }
          }
        }
      ],
      as: "inventario"
    }
  },
  {
    $unwind: { path: "$inventario", preserveNullAndEmptyArrays: true }
  },
  {
    $project: {
      _id: 0,
      tipoInstrumento: "$_id",
      totalReservas: 1,
      reservasActivas: 1,
      reservasFinalizadas: 1,
      reservasCanceladas: 1,
      instrumentosUtilizados: { $size: "$instrumentosReservados" },
      totalEnInventario: { $ifNull: ["$inventario.totalInstrumentos", 0] },
      disponibles: { $ifNull: ["$inventario.disponibles", 0] },
      reservados: { $ifNull: ["$inventario.reservados", 0] },
      tasaUtilizacion: {
        $round: [
          { $multiply: [
            { $divide: [
              { $size: "$instrumentosReservados" },
              { $ifNull: ["$inventario.totalInstrumentos", 1] }
            ]},
            100
          ]}, 2
        ]
      }
    }
  },
  {
    $sort: { totalReservas: -1 }
  }
]).forEach(printjson);

// 6. Historial de cursos de un estudiante específico
print('\n6️⃣  HISTORIAL DE CURSOS POR ESTUDIANTE');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Filtra inscripciones de un estudiante específico
- Une con información completa de cursos, sedes y profesores
- Ordena por fecha de inscripción
- Calcula progreso académico del estudiante
*/
// Tomamos el primer estudiante como ejemplo
const estudianteEjemplo = db.estudiantes.findOne({}, { _id: 1 });

db.inscripciones.aggregate([
  {
    $match: { estudiante: estudianteEjemplo._id }
  },
  {
    $lookup: {
      from: "estudiantes",
      localField: "estudiante",
      foreignField: "_id",
      as: "estudianteInfo"
    }
  },
  {
    $lookup: {
      from: "cursos",
      localField: "curso",
      foreignField: "_id",
      as: "cursoInfo"
    }
  },
  {
    $lookup: {
      from: "sedes",
      localField: "sede",
      foreignField: "_id",
      as: "sedeInfo"
    }
  },
  {
    $lookup: {
      from: "profesores",
      localField: "profesor",
      foreignField: "_id",
      as: "profesorInfo"
    }
  },
  {
    $unwind: "$estudianteInfo"
  },
  {
    $unwind: "$cursoInfo"
  },
  {
    $unwind: "$sedeInfo"
  },
  {
    $unwind: "$profesorInfo"
  },
  {
    $project: {
      _id: 0,
      estudiante: "$estudianteInfo.nombre",
      nivelEstudiante: "$estudianteInfo.nivelMusical",
      fechaInscripcion: 1,
      curso: "$cursoInfo.nombre",
      instrumento: "$cursoInfo.instrumento",
      nivelCurso: "$cursoInfo.nivel",
      duracion: "$cursoInfo.duracion",
      sede: "$sedeInfo.nombre",
      ciudad: "$sedeInfo.ciudad",
      profesor: "$profesorInfo.nombre",
      costo: 1,
      estado: 1,
      calificacionFinal: 1,
      fechaFinalizacion: 1
    }
  },
  {
    $sort: { fechaInscripcion: 1 }
  }
]).forEach(printjson);

// 7. Cursos actualmente en ejecución en cada sede
print('\n7️⃣  CURSOS ACTUALMENTE EN EJECUCIÓN POR SEDE');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Filtra cursos activos
- Calcula ocupación actual basada en inscripciones activas
- Agrupa por sede con detalles de cada curso
- Incluye métricas de ocupación y rentabilidad
*/
db.cursos.aggregate([
  {
    $match: { 
      activo: true,
      fechaFin: { $gte: new Date() }
    }
  },
  {
    $lookup: {
      from: "inscripciones",
      let: { cursoId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$curso", "$$cursoId"] },
            estado: "Activa"
          }
        }
      ],
      as: "inscripcionesActivas"
    }
  },
  {
    $lookup: {
      from: "sedes",
      localField: "sede",
      foreignField: "_id",
      as: "sedeInfo"
    }
  },
  {
    $lookup: {
      from: "profesores",
      localField: "profesor",
      foreignField: "_id",
      as: "profesorInfo"
    }
  },
  {
    $unwind: "$sedeInfo"
  },
  {
    $unwind: "$profesorInfo"
  },
  {
    $addFields: {
      estudiantesInscritos: { $size: "$inscripcionesActivas" },
      ocupacionPorcentaje: {
        $round: [
          { $multiply: [
            { $divide: [{ $size: "$inscripcionesActivas" }, "$cupoMaximo"] },
            100
          ]}, 2
        ]
      }
    }
  },
  {
    $group: {
      _id: "$sede",
      sede: { $first: "$sedeInfo.nombre" },
      ciudad: { $first: "$sedeInfo.ciudad" },
      cursosEnEjecucion: {
        $push: {
          curso: "$nombre",
          instrumento: "$instrumento",
          nivel: "$nivel",
          profesor: "$profesorInfo.nombre",
          fechaInicio: "$fechaInicio",
          fechaFin: "$fechaFin",
          estudiantesInscritos: "$estudiantesInscritos",
          cupoMaximo: "$cupoMaximo",
          ocupacionPorcentaje: "$ocupacionPorcentaje",
          costo: "$costo"
        }
      },
      totalCursosActivos: { $sum: 1 },
      totalEstudiantesActivos: { $sum: "$estudiantesInscritos" }
    }
  },
  {
    $sort: { totalEstudiantesActivos: -1 }
  }
]).forEach(printjson);

// 8. Detectar cursos que excedieron el cupo permitido
print('\n8️⃣  CURSOS CON EXCESO DE CUPO');
print('─────────────────────────────────────────────────────────');
/*
Esta agregación:
- Cuenta inscripciones totales por curso
- Compara con cupo máximo definido
- Identifica cursos sobrecupos
- Incluye análisis de impacto y recomendaciones
*/
db.inscripciones.aggregate([
  {
    $group: {
      _id: "$curso",
      totalInscripciones: { $sum: 1 },
      inscripcionesActivas: {
        $sum: { $cond: [{ $eq: ["$estado", "Activa"] }, 1, 0] }
      },
      inscripcionesCompletadas: {
        $sum: { $cond: [{ $eq: ["$estado", "Completada"] }, 1, 0] }
      }
    }
  },
  {
    $lookup: {
      from: "cursos",
      localField: "_id",
      foreignField: "_id",
      as: "cursoInfo"
    }
  },
  {
    $unwind: "$cursoInfo"
  },
  {
    $lookup: {
      from: "sedes",
      localField: "cursoInfo.sede",
      foreignField: "_id",
      as: "sedeInfo"
    }
  },
  {
    $lookup: {
      from: "profesores",
      localField: "cursoInfo.profesor",
      foreignField: "_id",
      as: "profesorInfo"
    }
  },
  {
    $unwind: "$sedeInfo"
  },
  {
    $unwind: "$profesorInfo"
  },
  {
    $addFields: {
      excedeCapacidad: {
        $gt: ["$totalInscripciones", "$cursoInfo.cupoMaximo"]
      },
      excseoCapacidadActiva: {
        $gt: ["$inscripcionesActivas", "$cursoInfo.cupoMaximo"]
      },
      excesoEstudiantes: {
        $subtract: ["$totalInscripciones", "$cursoInfo.cupoMaximo"]
      },
      excesoEstudiantesActivos: {
        $subtract: ["$inscripcionesActivas", "$cursoInfo.cupoMaximo"]
      }
    }
  },
  {
    $match: {
      $or: [
        { excedeCapacidad: true },
        { excseoCapacidadActiva: true }
      ]
    }
  },
  {
    $project: {
      _id: 0,
      curso: "$cursoInfo.nombre",
      instrumento: "$cursoInfo.instrumento",
      nivel: "$cursoInfo.nivel",
      sede: "$sedeInfo.nombre",
      profesor: "$profesorInfo.nombre",
      cupoMaximo: "$cursoInfo.cupoMaximo",
      totalInscripciones: 1,
      inscripcionesActivas: 1,
      excesoTotal: {
        $cond: [
          { $gt: ["$excesoEstudiantes", 0] },
          "$excesoEstudiantes",
          0
        ]
      },
      excesoActivo: {
        $cond: [
          { $gt: ["$excesoEstudiantesActivos", 0] },
          "$excesoEstudiantesActivos",
          0
        ]
      },
      porcentajeSobrecupo: {
        $round: [
          { $multiply: [
            { $divide: ["$excesoEstudiantes", "$cursoInfo.cupoMaximo"] },
            100
          ]}, 2
        ]
      }
    }
  },
  {
    $sort: { excesoActivo: -1, excesoTotal: -1 }
  }
]).forEach(printjson);

print('\n📊 RESUMEN DE CONSULTAS ANALÍTICAS COMPLETADAS');
print('═══════════════════════════════════════════════════════════');
print('✅ 8 consultas ejecutadas exitosamente');
print('✅ Datos analizados desde múltiples perspectivas');
print('✅ Métricas de negocio calculadas');
print('✅ Informes listos para toma de decisiones');