// transactions.js
// Ejecutar en mongosh: mongosh ./transactions.js
const conn = db.getMongo();
const session = conn.startSession();
const campusDB = session.getDatabase('campus_music');

function inscribir(estudianteId, cursoId) {
  const opts = { readConcern: { level: "local" }, writeConcern: { w: "majority" } };
  try {
    session.startTransaction(opts);

    // 1) Recupera curso en la sesión (opcional)
    const curso = campusDB.cursos.findOne({ _id: cursoId }, { session });
    if (!curso) throw new Error('Curso no existe');

    // 2) Intentar decrementar cupo de forma atómica
    const upd = campusDB.cursos.updateOne(
      { _id: cursoId, cupos_disponibles: { $gt: 0 } },
      { $inc: { cupos_disponibles: -1 } },
      { session }
    );

    if (upd.matchedCount === 0) {
      // no cupo disponible
      throw new Error('No hay cupos disponibles para el curso');
    }

    // 3) Insertar inscripción
    const ins = {
      estudiante_id: estudianteId,
      curso_id: cursoId,
      sede_id: curso.sede_id,
      profesor_id: curso.profesor_id,
      fechaInscripcion: new Date(),
      costo: curso.costo,
      estadoPago: 'Pendiente'
    };
    campusDB.inscripciones.insertOne(ins, { session });

    // 4) Commit
    session.commitTransaction();
    print('Inscripción realizada con éxito.');
  } catch (err) {
    print('Error en transacción:', err);
    try { session.abortTransaction(); } catch (e) { print('Abort fallo:', e); }
  } finally {
    session.endSession();
  }
}


