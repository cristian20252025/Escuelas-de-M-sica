// test_dataset.js
// Ejecutar en mongosh: mongosh ./test_dataset.js
const db = db.getSiblingDB('campus_music');
const { ObjectId } = require('mongodb'); // en mongosh, ObjectId() está disponible; esta línea es informativa

// 1) Sed es (3)
const sedesDocs = [
  { codigo: 'BOG', ciudad: 'Bogotá', direccion: 'Cll 100 #10-20', capacidad: 120, cursos_disponibles: [] },
  { codigo: 'MED', ciudad: 'Medellín', direccion: 'Cr 43 #22-10', capacidad: 90, cursos_disponibles: [] },
  { codigo: 'CAL', ciudad: 'Cali', direccion: 'Av. 6 #30-50', capacidad: 80, cursos_disponibles: [] }
];
const sedesRes = db.sedes.insertMany(sedesDocs);
const sedeIds = Object.values(sedesRes.insertedIds);

// 2) Profesores (10)
const profs = [
  { documento:'1001', nombre:'Ana Gómez', especialidades:['Piano','Teoría'], experiencia_anios:6, contacto:{ email:'ana@cm.com', telefono:'3001110001' } },
  { documento:'1002', nombre:'Luis Torres', especialidades:['Guitarra','Canto'], experiencia_anios:8, contacto:{ email:'luis@cm.com', telefono:'3001110002' } },
  { documento:'1003', nombre:'María Li', especialidades:['Violín','Música clásica'], experiencia_anios:10, contacto:{ email:'maria@cm.com', telefono:'3001110003' } },
  { documento:'1004', nombre:'Carlos Ruiz', especialidades:['Batería','Percusión'], experiencia_anios:5, contacto:{ email:'carlos@cm.com', telefono:'3001110004' } },
  { documento:'1005', nombre:'Sofía Martínez', especialidades:['Canto','Teatro musical'], experiencia_anios:7, contacto:{ email:'sofia@cm.com', telefono:'3001110005' } },
  { documento:'1006', nombre:'Diego Herrera', especialidades:['Guitarra','Producción'], experiencia_anios:9, contacto:{ email:'diego@cm.com', telefono:'3001110006' } },
  { documento:'1007', nombre:'Valeria Peña', especialidades:['Piano','Composición'], experiencia_anios:4, contacto:{ email:'valeria@cm.com', telefono:'3001110007' } },
  { documento:'1008', nombre:'Andrés Gil', especialidades:['Contrabajo','Jazz'], experiencia_anios:11, contacto:{ email:'andres@cm.com', telefono:'3001110008' } },
  { documento:'1009', nombre:'Paola Díaz', especialidades:['Teoría','Afinación'], experiencia_anios:3, contacto:{ email:'paola@cm.com', telefono:'3001110009' } },
  { documento:'1010', nombre:'Marco Peña', especialidades:['Trompeta','Metodología'], experiencia_anios:12, contacto:{ email:'marco@cm.com', telefono:'3001110010' } }
];
const profRes = db.profesores.insertMany(profs);
const profIds = Object.values(profRes.insertedIds);

// 3) Cursos: 5 por sede (total 15)
const instrumentosEj = ['Piano','Guitarra','Violín','Teoría Musical','Canto'];
const niveles = ['Básico','Intermedio','Avanzado'];
const cursos = [];
for (let i = 0; i < sedeIds.length; i++) {
  for (let j = 0; j < 5; j++) {
    const profesorId = profIds[(i*2 + j) % profIds.length];
    const doc = {
      codigo: `C-${i}-${j}`,
      nombre: `${instrumentosEj[j]} ${niveles[j%3]}`,
      instrumento: instrumentosEj[j],
      nivel: niveles[j%3],
      duracion_semanas: 12,
      cupos_totales: 12,
      cupos_disponibles: 12,
      horario: { dias: ['Lunes','Miércoles'], horaInicio: '17:00', horaFin: '19:00' },
      sede_id: sedeIds[i],
      profesor_id: profesorId,
      fechaInicio: new Date('2025-09-01T00:00:00Z'),
      fechaFin: new Date('2025-12-01T00:00:00Z'),
      costo: 150000.0,
      activo: true
    };
    cursos.push(doc);
  }
}
const cursoRes = db.cursos.insertMany(cursos);
const cursoIds = Object.values(cursoRes.insertedIds);

// 4) Actualizar sedes con cursos_disponibles
for (let i = 0; i < sedeIds.length; i++) {
  const cursosPorSede = Object.keys(cursoRes.insertedIds)
    .filter(k => Math.floor(k/5) === i)
    .map(k => cursoIds[k]);
  db.sedes.updateOne({ _id: sedeIds[i] }, { $set: { cursos_disponibles: cursosPorSede }});
}

// 5) Estudiantes (15)
const nivelesEst = ['Básico','Intermedio','Avanzado'];
const estudiantes = [];
for (let i = 1; i <= 15; i++) {
  estudiantes.push({
    documento: (2000 + i).toString(),
    nombre: `Estudiante ${i}`,
    contacto: { email: `est${i}@mail.com`, telefono: `3100000${100+i}` },
    nivel: nivelesEst[i % 3],
    fechaRegistro: new Date()
  });
}
const estRes = db.estudiantes.insertMany(estudiantes);
const estIds = Object.values(estRes.insertedIds);

// 6) Instrumentos (20)
const tiposInstr = ['Guitarra','Piano','Violín','Bajo','Saxofón','Batería'];
const instrumentos = [];
for (let i = 1; i <= 20; i++) {
  instrumentos.push({
    codigo: `I-${i}`,
    tipo: tiposInstr[i % tiposInstr.length],
    marca: 'Yamaha',
    disponible: true,
    sede_id: sedeIds[i % sedeIds.length],
    detalles: { serie: `SN${1000+i}` }
  });
}
const instRes = db.instrumentos.insertMany(instrumentos);
const instIds = Object.values(instRes.insertedIds);

// 7) Inscripciones (30) --> generamos hasta 30 asegurando cupo
const inscripciones = [];
let created = 0;
let attempts = 0;
while (created < 30 && attempts < 200) {
  attempts++;
  const estudianteId = estIds[Math.floor(Math.random()*estIds.length)];
  const cursoId = cursoIds[Math.floor(Math.random()*cursoIds.length)];
  const curso = db.cursos.findOne({ _id: cursoId });
  if (!curso || curso.cupos_disponibles <= 0) continue;
  // crear inscripción
  inscripciones.push({
    estudiante_id: estudianteId,
    curso_id: cursoId,
    sede_id: curso.sede_id,
    profesor_id: curso.profesor_id,
    fechaInscripcion: new Date(),
    costo: curso.costo,
    estadoPago: 'Pendiente'
  });
  // reducir cupo (sin transacción porque esto es data seed; para run-time usar transaction)
  db.cursos.updateOne({ _id: cursoId }, { $inc: { cupos_disponibles: -1 }});
  created++;
}
if (inscripciones.length > 0) db.inscripciones.insertMany(inscripciones);

// 8) Reservas de instrumentos (10)
const reservas = [];
for (let r = 0; r < 10; r++) {
  const estudianteId = estIds[Math.floor(Math.random()*estIds.length)];
  const instrumentoId = instIds[Math.floor(Math.random()*instIds.length)];
  reservas.push({
    instrumento_id: instrumentoId,
    estudiante_id: estudianteId,
    fechaReserva: new Date(),
    fechaFin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // +7 días
    estado: 'Activa',
    notas: ''
  });
  // marcar instrumento no disponible
  db.instrumentos.updateOne({ _id: instrumentoId }, { $set: { disponible: false }});
}
if (reservas.length > 0) db.reservas_instrumentos.insertMany(reservas);

print('test_dataset.js: inserciones realizadas:');
print('sedes:', db.sedes.countDocuments());
print('profesores:', db.profesores.countDocuments());
print('cursos:', db.cursos.countDocuments());
print('estudiantes:', db.estudiantes.countDocuments());
print('instrumentos:', db.instrumentos.countDocuments());
print('inscripciones:', db.inscripciones.countDocuments());
print('reservas:', db.reservas_instrumentos.countDocuments());
