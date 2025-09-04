// test_dataset.js
use('campus_music');

// --- Poblar sedes ---
const sedes = [
  {
    nombre: "Sede Bogotá",
    ciudad: "Bogotá",
    direccion: "Cra 10 # 20-30",
    telefono: "3101234567",
    capacidad: 50,
    activa: true,
    fechaCreacion: new Date()
  },
  {
    nombre: "Sede Medellín",
    ciudad: "Medellín",
    direccion: "Calle 45 # 67-89",
    telefono: "3012345678",
    capacidad: 40,
    activa: true,
    fechaCreacion: new Date()
  },
  {
    nombre: "Sede Cali",
    ciudad: "Cali",
    direccion: "Avenida 5 # 10-20",
    telefono: "3123456789",
    capacidad: 35,
    activa: true,
    fechaCreacion: new Date()
  }
];

const sedeResult = db.sedes.insertMany(sedes);

// --- Poblar profesores ---
const profesores = [
  { nombre: "Juan Pérez", documento: "123456789", email: "juan.perez@mail.com", telefono: "3001112222", especialidades: ["Piano"], experiencia: 10, sedesAsignadas: [sedeResult.insertedIds["0"]], activo: true, fechaIngreso: new Date() },
  { nombre: "María Gómez", documento: "987654321", email: "maria.gomez@mail.com", telefono: "3002223333", especialidades: ["Guitarra"], experiencia: 8, sedesAsignadas: [sedeResult.insertedIds["1"]], activo: true, fechaIngreso: new Date() },
  { nombre: "Carlos Ruiz", documento: "111223333", email: "carlos.ruiz@mail.com", telefono: "3003334444", especialidades: ["Violín"], experiencia: 12, sedesAsignadas: [sedeResult.insertedIds["2"]], activo: true, fechaIngreso: new Date() },
  { nombre: "Luisa Fernández", documento: "222334444", email: "luisa.fernandez@mail.com", telefono: "3004445555", especialidades: ["Canto"], experiencia: 7, sedesAsignadas: [sedeResult.insertedIds["0"], sedeResult.insertedIds["2"]], activo: true, fechaIngreso: new Date() },
  { nombre: "Andrés López", documento: "333445555", email: "andres.lopez@mail.com", telefono: "3005556666", especialidades: ["Bateria"], experiencia: 9, sedesAsignadas: [sedeResult.insertedIds["1"]], activo: true, fechaIngreso: new Date() },
  { nombre: "Sofía Ramírez", documento: "444556666", email: "sofia.ramirez@mail.com", telefono: "3006667777", especialidades: ["Flauta"], experiencia: 6, sedesAsignadas: [sedeResult.insertedIds["2"]], activo: true, fechaIngreso: new Date() },
  { nombre: "Miguel Torres", documento: "555667777", email: "miguel.torres@mail.com", telefono: "3007778888", especialidades: ["Bajo"], experiencia: 11, sedesAsignadas: [sedeResult.insertedIds["0"]], activo: true, fechaIngreso: new Date() }
];

const profesoresInsert = db.profesores.insertMany(profesores);

// --- Poblar cursos para cada sede ---
const sedesArray = Object.values(sedeResult.insertedIds);
const cursos = [
  // Para sede 0 (Bogotá)
  {
    nombre: "Piano Básico",
    instrumento: "Piano",
    nivel: "Básico",
    duracion: 12,
    cupoMaximo: 10,
    cuposDisponibles: 10,
    costo: 200000,
    horario: { dias: ["Lunes", "Miércoles"], horaInicio: "18:00", horaFin: "20:00" },
    sede: sedesArray[0],
    profesor: profesoresInsert.insertedIds[0],
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().getTime() + 12 * 7 * 24 * 60 * 60 * 1000),
    activo: true
  },
  {
    nombre: "Guitarra Intermedia",
    instrumento: "Guitarra",
    nivel: "Intermedio",
    duracion: 12,
    cupoMaximo: 8,
    cuposDisponibles: 8,
    costo: 180000,
    horario: { dias: ["Martes", "Jueves"], horaInicio: "17:00", horaFin: "19:00" },
    sede: sedesArray[0],
    profesor: profesoresInsert.insertedIds[1],
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().getTime() + 12 * 7 * 24 * 60 * 60 * 1000),
    activo: true
  },
  // Para sede 1 (Medellín)
  {
    nombre: "Violín Avanzado",
    instrumento: "Violin",
    nivel: "Avanzado",
    duracion: 16,
    cupoMaximo: 6,
    cuposDisponibles: 6,
    costo: 250000,
    horario: { dias: ["Lunes", "Jueves"], horaInicio: "19:00", horaFin: "21:00" },
    sede: sedesArray[1],
    profesor: profesoresInsert.insertedIds[2],
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().getTime() + 16 * 7 * 24 * 60 * 60 * 1000),
    activo: true
  },
  {
    nombre: "Canto Básico",
    instrumento: "Canto",
    nivel: "Básico",
    duracion: 10,
    cupoMaximo: 12,
    cuposDisponibles: 12,
    costo: 150000,
    horario: { dias: ["Miércoles"], horaInicio: "16:00", horaFin: "17:30" },
    sede: sedesArray[1],
    profesor: profesoresInsert.insertedIds[3],
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().getTime() + 10 * 7 * 24 * 60 * 60 * 1000),
    activo: true
  },
  // Para sede 2 (Cali)
  {
    nombre: "Flauta Intermedia",
    instrumento: "Flauta",
    nivel: "Intermedio",
    duracion: 14,
    cupoMaximo: 7,
    cuposDisponibles: 7,
    costo: 220000,
    horario: { dias: ["Martes", "Jueves"], horaInicio: "17:30", horaFin: "19:30" },
    sede: sedesArray[2],
    profesor: profesoresInsert.insertedIds[4],
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().getTime() + 14 * 7 * 24 * 60 * 60 * 1000),
    activo: true
  }
];

db.cursos.insertMany(cursos);

// --- Poblar estudiantes ---
const estudiantes = [
  { nombre: "Ana Martínez", documento: "4455667788", email: "ana@mail.com", telefono: "3151234567", fechaNacimiento: new Date("2000-05-15"), nivelMusical: "Intermedio", contactoEmergencia: { nombre: "Luis Martinez", telefono: "3159876543", relacion: "Padre" }, activo: true, fechaRegistro: new Date() },
  { nombre: "Luis Gómez", documento: "5566778899", email: "luis@mail.com", telefono: "3161234567", fechaNacimiento: new Date("1998-02-20"), nivelMusical: "Básico", contactoEmergencia: { nombre: "Maria Gómez", telefono: "3169876543", relacion: "Madre" }, activo: true, fechaRegistro: new Date() },
  { nombre: "Sofía Castro", documento: "6677889900", email: "sofia@mail.com", telefono: "3171234567", fechaNacimiento: new Date("2002-11-10"), nivelMusical: "Avanzado", contactoEmergencia: { nombre: "Carlos Castro", telefono: "3179876543", relacion: "Hermano" }, activo: true, fechaRegistro: new Date() },
  { nombre: "Pedro Jiménez", documento: "7788990011", email: "pedro@mail.com", telefono: "3181234567", fechaNacimiento: new Date("1995-07-05"), nivelMusical: "Intermedio", contactoEmergencia: { nombre: "Lucía Jiménez", telefono: "3189876543", relacion: "Madre" }, activo: true, fechaRegistro: new Date() },
  { nombre: "María López", documento: "8899001122", email: "maria@mail.com", telefono: "3191234567", fechaNacimiento: new Date("2001-03-22"), nivelMusical: "Básico", contactoEmergencia: { nombre: "Juan López", telefono: "3199876543", relacion: "Padre" }, activo: true, fechaRegistro: new Date() },
  // Agrega más estudiantes si quieres
];

db.estudiantes.insertMany(estudiantes);

// --- Poblar instrumentos ---
const instrumentos = [
  { nombre: "Piano Yamaha U1", tipo: "Piano", marca: "Yamaha", modelo: "U1", numeroSerie: "SN10001", estado: "Disponible", sede: sedesArray[0], fechaAdquisicion: new Date("2018-03-01"), valorComercial: 5000 },
  { nombre: "Guitarra Fender Stratocaster", tipo: "Guitarra", marca: "Fender", modelo: "Stratocaster", numeroSerie: "SN10002", estado: "Disponible", sede: sedesArray[0], fechaAdquisicion: new Date("2019-07-15"), valorComercial: 1500 },
  { nombre: "Violin Stradivarius", tipo: "Violin", marca: "Stradivarius", modelo: "ModelX", numeroSerie: "SN10003", estado: "Disponible", sede: sedesArray[1], fechaAdquisicion: new Date("2017-05-20"), valorComercial: 25000 },
  { nombre: "Bateria Yamaha Stage Custom", tipo: "Bateria", marca: "Yamaha", modelo: "Stage", numeroSerie: "SN10004", estado: "Disponible", sede: sedesArray[1], fechaAdquisicion: new Date("2020-01-10"), valorComercial: 3000 },
  { nombre: "Flauta Yamaha 20X", tipo: "Flauta", marca: "Yamaha", modelo: "20X", numeroSerie: "SN10005", estado: "Disponible", sede: sedesArray[2], fechaAdquisicion: new Date("2019-11-11"), valorComercial: 800 },
  { nombre: "Bajo Fender Jazz", tipo: "Bajo", marca: "Fender", modelo: "J Bass", numeroSerie: "SN10006", estado: "Disponible", sede: sedesArray[2], fechaAdquisicion: new Date("2018-09-09"), valorComercial: 1200 },
  // Agrega más instrumentos si deseas
];

db.instrumentos.insertMany(instrumentos);

// --- Poblar inscripciones ---
const estudiantesDocs = db.estudiantes.find().toArray();
const cursosDocs = db.cursos.find().toArray();

const inscripciones = [];
for (let i = 0; i < 30; i++) {
  const est = estudiantesDocs[Math.floor(Math.random() * estudiantesDocs.length)];
  const curso = cursosDocs[Math.floor(Math.random() * cursosDocs.length)];
  inscripciones.push({
    estudiante: est._id,
    curso: curso._id,
    sede: curso.sede,
    profesor: curso.profesor,
    fechaInscripcion: new Date(new Date().getTime() - Math.random() * 45 * 24 * 60 * 60 * 1000), // últimos 45 días
    costo: curso.costo,
    estado: "Activa"
  });
}
db.inscripciones.insertMany(inscripciones);

// --- Reservas de instrumentos ---
const estudiantesReservas = estudiantesDocs.slice(0, 10);
const instrumentosDocs = db.instrumentos.find().toArray();
const reservas = [];

for (let i = 0; i < 10; i++) {
  const est = estudiantesReservas[Math.floor(Math.random() * estudiantesReservas.length)];
  const instr = instrumentosDocs[Math.floor(Math.random() * instrumentosDocs.length)];
  reservas.push({
    estudiante: est._id,
    instrumento: instr._id,
    fechaReserva: new Date(),
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 semana
    estado: "Activa"
  });
}
db.reservas_instrumentos.insertMany(reservas);

print("✅ Datos de prueba extendidos y poblando la base correctamente");