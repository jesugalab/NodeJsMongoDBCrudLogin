const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AsignaturaSchema = Schema({
  nombre: {
    type: String,
    required: true
},

  curso: {
    type: Number,
    required: true
},

  estudio_id: 
    {type: mongoose.Schema.Types.ObjectId, ref:'estudio'}
,

  listaAlumnos: [
    {type: mongoose.Schema.Types.ObjectId, ref:'usuario'}
],

listaProfesores: [
  {type: mongoose.Schema.Types.ObjectId, ref:'usuario'}
]  
});
AsignaturaSchema.methods.findAll = async function (usuario) {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  return await Asignatura.find({ 'usuario': usuario })
    .then(result => result)
    .catch(error => console.log(error));
};

AsignaturaSchema.methods.insert = async function () {
  await this.save()
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

AsignaturaSchema.methods.update = async function (id, asignatura) {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  await Asignatura.updateOne({ _id: id }, asignatura)
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

AsignaturaSchema.methods.delete = async function (id) {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  await Asignatura.deleteOne({ _id: id })
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

AsignaturaSchema.methods.findById = async function (id) {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  return await Asignatura.findById(id)
    .then(result => result)
    .catch(error => console.log(error));
};

AsignaturaSchema.methods.findSearch = async function (search, usuario) {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  return await Asignatura.find({ 'nombre': new RegExp(search, 'i'), 'usuario': usuario })
    .then(result => result)
    .catch(error => console.log(error));
};
AsignaturaSchema.statics.findByUser = async function(userId, userRole) {
  let asignaturas;

  if (userRole.toLowerCase() === 'profesor') {
      asignaturas = await this.find({
          listaProfesores: userId
      }).lean();
  } else if (userRole.toLowerCase() === 'alumno') {
      asignaturas = await this.find({
          listaAlumnos: userId
      }).lean();
  } else {
      return [];
  }

  // Obtener los IDs de los estudios relacionados
  const estudioIds = asignaturas.map(asignatura => asignatura.estudio_id);

  // Obtener los datos de los estudios
  const Estudio = mongoose.model('listaEstudio');
  const estudios = await Estudio.find({
      _id: {
          $in: estudioIds
      }
  }).lean();

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
  const Usuario = mongoose.model('listaUsuario');
  const alumnos = await Usuario.find({
      _id: {
          $in: alumnoIds
      }
  }).lean();
  const profesores = await Usuario.find({
      _id: {
          $in: profesorIds
      }
  }).lean();

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
      estudio: estudiosMap[asignatura.estudio_id] || {
          nombre: "No encontrado",
          tipo: "-"
      },
      listaAlumnos: asignatura.listaAlumnos.map(id => alumnosMap[id] || {
          nombre: "No encontrado",
          apellidos: "",
          email: ""
      }),
      listaProfesores: asignatura.listaProfesores.map(id => profesoresMap[id] || {
          nombre: "No encontrado",
          apellidos: "",
          email: ""
      })
  }));

  return asignaturasConDatos;
};

module.exports = mongoose.model('listaAsignatura', AsignaturaSchema);
