// transactions.js

// Iniciar la sesión para la transacción
const session = db.getMongo().startSession();

try {
  // Comenzar la transacción
  session.startTransaction();

  // Obtener el contexto de la base de datos en la sesión
  const dbs = session.getDatabase("campus_music");

  // IDs de ejemplo, reemplaza con IDs reales
  const estudianteId = ObjectId("ID_ESTUDIANTE");
  const cursoId = ObjectId("ID_CURSO");

  // --- Paso 1: Verificar cupos disponibles en el curso ---
  const curso = dbs.cursos.findOne({ _id: cursoId });
  if (!curso) {
    throw new Error("Curso no encontrado");
  }
  if (curso.cuposDisponibles <= 0) {
    throw new Error("No hay cupos disponibles en el curso");
  }

  // --- Paso 2: Insertar la inscripción ---
  dbs.inscripciones.insertOne({
    estudiante: estudianteId,
    curso: cursoId,
    sede: curso.sede,
    profesor: curso.profesor,
    fechaInscripcion: new Date(),
    costo: curso.costo,
    estado: "Activa"
  });

  // --- Paso 3: Actualizar la cantidad de cupos disponibles ---
  const updateResult = dbs.cursos.updateOne(
    { _id: cursoId, cuposDisponibles: { $gt: 0 } },
    { $inc: { cuposDisponibles: -1 } }
  );

  if (updateResult.modifiedCount === 0) {
    throw new Error("No se pudo actualizar los cupos, quizás ya no hay disponibles");
  }

  // --- Paso 4: Confirmar y cerrar la transacción ---
  session.commitTransaction();
  print("Inscripción realizada y cupos actualizados correctamente");

} catch (error) {
  // En caso de error, hacer rollback
  print("Error en la transacción: " + error.message);
  session.abortTransaction();
} finally {
  // Finalizar la sesión
  session.endSession();
}