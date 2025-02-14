const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AsignaturaSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  curso: {
    type: Number,
    required: true
  },
  estudio_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Estudio'
  },
  listaAlumnos: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  ],
  listaProfesores: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  ]
});

AsignaturaSchema.statics.findByUser = async function(userId, userRole) {
  let asignaturas;

  if (userRole.toLowerCase() === 'profesor') {
    asignaturas = await this.find({ listaProfesores: userId }).lean();
  } else if (userRole.toLowerCase() === 'alumno') {
    asignaturas = await this.find({ listaAlumnos: userId }).lean();
  } else {
    return [];
  }

  // Obtener los IDs de los estudios relacionados
  const estudioIds = asignaturas.map(asignatura => asignatura.estudio_id);

  // Obtener los datos de los estudios
  const Estudio = mongoose.model('Estudio');
  const estudios = await Estudio.find({ _id: { $in: estudioIds } }).lean();

  // Crear un mapa de estudios por ID
  const estudiosMap = {};
  estudios.forEach(estudio => {
    estudiosMap[estudio._id] = estudio;
  });

  // Obtener los IDs de los alumnos y profesores relacionados
  let alumnoIds = [];
  let profesorIds = [];

  asignaturas.forEach(asignatura => {
    alumnoIds = alumnoIds.concat(asignatura.listaAlumnos);
    profesorIds = profesorIds.concat(asignatura.listaProfesores);
  });

  // Eliminar IDs duplicados
  alumnoIds = [...new Set(alumnoIds)];
  profesorIds = [...new Set(profesorIds)];

  // Obtener los datos de los alumnos y profesores
  const Usuario = mongoose.model('Usuario');
  const alumnos = await Usuario.find({ _id: { $in: alumnoIds } }).lean();
  const profesores = await Usuario.find({ _id: { $in: profesorIds } }).lean();

  // Crear mapas de alumnos y profesores por ID
  const alumnosMap = {};
  alumnos.forEach(alumno => {
    alumnosMap[alumno._id] = alumno;
  });
  const profesoresMap = {};
  profesores.forEach(profesor => {
    profesoresMap[profesor._id] = profesor;
  });

  // Reemplazar los IDs con los objetos correspondientes
  const asignaturasConDatos = asignaturas.map(asignatura => ({
    ...asignatura,
    estudio: estudiosMap[asignatura.estudio_id] || { nombre: "No encontrado", tipo: "-" },
    listaAlumnos: asignatura.listaAlumnos.map(id => alumnosMap[id] || { nombre: "No encontrado", apellidos: "", email: "" }),
    listaProfesores: asignatura.listaProfesores.map(id => profesoresMap[id] || { nombre: "No encontrado", apellidos: "", email: "" })
  }));

  return asignaturasConDatos;
};

module.exports = mongoose.model('Asignatura', AsignaturaSchema);
