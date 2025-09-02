// aggregations.js
const db = db.getSiblingDB('campus_music');

// 1) ¿Cuántos estudiantes se inscribieron por sede en el último mes?
const desde = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
const inscritosPorSede = db.inscripciones.aggregate([
  { $match: { fechaInscripcion: { $gte: desde } } },
  { $group: { _id: "$sede_id", total: { $sum: 1 } } },
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sede" } },
  { $unwind: "$sede" },
  { $project: { sede: "$sede.codigo", ciudad: "$sede.ciudad", total: 1 } }
]).toArray();
printjson(inscritosPorSede);

// 2) ¿Cuáles son los cursos más demandados en cada sede? (top 3)
const cursosMasDemandados = db.inscripciones.aggregate([
  { $group: { _id: { sede: "$sede_id", curso: "$curso_id" }, count: { $sum: 1 } } },
  { $sort: { "_id.sede": 1, count: -1 } },
  { $group: {
      _id: "$_id.sede",
      topCursos: { $push: { curso_id: "$_id.curso", inscritos: "$count" } }
  }},
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sede" } },
  { $unwind: "$sede" },
  { $project: { sede: "$sede.codigo", topCursos: { $slice: ["$topCursos", 3] } } }
]).toArray();
printjson(cursosMasDemandados);

// 3) ¿Cuál es el ingreso total generado por inscripciones en cada sede?
const ingresoPorSede = db.inscripciones.aggregate([
  { $group: { _id: "$sede_id", ingresoTotal: { $sum: "$costo" } } },
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sede" } },
  { $unwind: "$sede" },
  { $project: { sede: "$sede.codigo", ingresoTotal: 1 } }
]).toArray();
printjson(ingresoPorSede);

// 4) ¿Qué profesor tiene más estudiantes asignados? (por número distinto de estudiantes)
const profesorMasEstudiantes = db.inscripciones.aggregate([
  { $group: { _id: { prof: "$profesor_id", estudiante: "$estudiante_id" } } },
  { $group: { _id: "$_id.prof", estudiantesUnicos: { $sum: 1 } } },
  { $sort: { estudiantesUnicos: -1 } },
  { $limit: 1 },
  { $lookup: { from: "profesores", localField: "_id", foreignField: "_id", as: "prof" } },
  { $unwind: "$prof" },
  { $project: { profesor: "$prof.nombre", estudiantesUnicos: 1 } }
]).toArray();
printjson(profesorMasEstudiantes);

// 5) ¿Qué instrumento es el más reservado?
const instrumentoMasReservado = db.reservas_instrumentos.aggregate([
  { $group: { _id: "$instrumento_id", reservas: { $sum: 1 } } },
  { $sort: { reservas: -1 } },
  { $limit: 1 },
  { $lookup: { from: "instrumentos", localField: "_id", foreignField: "_id", as: "instrumento" } },
  { $unwind: "$instrumento" },
  { $project: { tipo: "$instrumento.tipo", codigo: "$instrumento.codigo", reservas: 1 } }
]).toArray();
printjson(instrumentoMasReservado);

// 6) Historial de cursos de un estudiante (pasar estudiante_id)
function historialEstudiante(estudianteId) {
  return db.inscripciones.aggregate([
    { $match: { estudiante_id: estudianteId } },
    { $lookup: { from: "cursos", localField: "curso_id", foreignField: "_id", as: "curso" } },
    { $unwind: "$curso" },
    { $lookup: { from: "sedes", localField: "sede_id", foreignField: "_id", as: "sede" } },
    { $unwind: "$sede" },
    { $lookup: { from: "profesores", localField: "profesor_id", foreignField: "_id", as: "profesor" } },
    { $unwind: "$profesor" },
    { $project: {
        fecha: "$fechaInscripcion",
        sede: "$sede.codigo",
        curso: "$curso.nombre",
        profesor: "$profesor.nombre",
        nivel: "$curso.nivel",
        costo: "$costo"
    }},
    { $sort: { fecha: -1 } }
  ]).toArray();
}
// ejemplo de uso:
// printjson(historialEstudiante(ObjectId("...")));

// 7) Listar cursos actualmente en ejecución en cada sede (fechaInicio <= now <= fechaFin)
const ahora = new Date();
const cursosEnEjecucion = db.cursos.aggregate([
  { $match: { fechaInicio: { $lte: ahora }, fechaFin: { $gte: ahora }, activo: true } },
  { $lookup: { from: "sedes", localField: "sede_id", foreignField: "_id", as: "sede" } },
  { $unwind: "$sede" },
  { $project: { sede: "$sede.codigo", curso: "$nombre", profesor_id: 1 } },
  { $group: { _id: "$sede", cursos: { $push: "$curso" } } }
]).toArray();
printjson(cursosEnEjecucion);

// 8) Detectar cursos que excedieron el cupo permitido en algún momento.
// (Contamos inscripciones por curso y lo comparamos con cupos_totales)
const cursosExcedidos = db.inscripciones.aggregate([
  { $group: { _id: "$curso_id", inscritos: { $sum: 1 } } },
  { $lookup: { from: "cursos", localField: "_id", foreignField: "_id", as: "curso" } },
  { $unwind: "$curso" },
  { $project: { curso: "$curso.nombre", codigo: "$curso.codigo", inscritos: 1, cupos_totales: "$curso.cupos_totales" } },
  { $match: { $expr: { $gt: ["$inscritos", "$cupos_totales"] } } }
]).toArray();
printjson(cursosExcedidos);

print('aggregations.js: terminado.');
