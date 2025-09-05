
db.createCollection('instrumentos', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Schema de validación para instrumentos',
        required: ['nombre', 'tipo', 'precio', 'estado', 'sedeId'],
        properties: {
          nombre: {
            bsonType: 'string',
            description: 'Nombre identificador del instrumento'
},
tipo: {
  bsonType: 'string',
  enum: ['Piano', 'Guitarra', 'Violin', 'Bateria', 'Bajo', 'canto'],
  description: 'Tipo de instrumento'
},
precio: {
  bsonType: 'double',
  minimum:0,
  description: 'valor del instrumento'
},
modelo: {
  bsonType: 'string',
  description: 'Modelo del instrumento'
},
estado: {
  bsonType: 'string',
  enum: ['Disponible', 'Reservado', 'En_Mantenimiento',],
  description: 'Estado actual del instrumento'
},
sedeId: {
  bsonType: 'objectId',
  description: 'ID de la sede donde se encuentra el instrumento'
},
fecha_registro:{
    bsonType: 'date',
    description: 'Fecha de registro'
}
}
}
}
});

db.instrumentos.insertOne({ fecha_registro: new Date()}, {cantidadInicial: 1})

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
        estudiantesInscritos: { $addToSet: "$instrumentos" },
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
        estudiantesUnicos: { $size: "$instrumentosRegistrados" },
        totalInscripciones: 1
      }
    },
    {
      $sort: { instrumentosUnicos: -1 }
    }
  ]).forEach(printjson);
  