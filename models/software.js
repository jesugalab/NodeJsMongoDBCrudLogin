const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const softwareSchema = Schema({
  
  descripcion: {
    type: String,
    required: true
},

  link: {
    type: String,
    required: true
  },
  archivo: {
    type: String
  },

  asignatura_id:  {type: mongoose.Schema.Types.ObjectId, ref:'listaSofware'}

});


softwareSchema.methods.findAll= async function (software) {
  const Software = mongoose.model("listaSofware", softwareSchema);
  return await Software.find({'software':software}) 
  .then(result => {return result})
  .catch(error => console.log(error));
};

softwareSchema.methods.insert= async function () {
  //await this.save();
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};


softwareSchema.methods.update= async (id, software) => {
  const Software = mongoose.model("listaSoftware", softwareSchema);
  await Software.updateOne({_id: id}, software)
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

softwareSchema.methods.delete= async function (id) {
  const Software = mongoose.model("listaSoftware", softwareSchema);
  await Software.deleteOne({_id: id})
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

softwareSchema.methods.findById= async function (id) {
  const Software = mongoose.model("listaSoftware", softwareSchema);
  return await Software.findById(id)
  .then(result => {return result})
  .catch(error => console.log(error));
};

// este seria buacar por asignatura
softwareSchema.methods.findSearch= async function (search, usuario) {
  const Software = mongoose.model("listaSoftware", softwareSchema);
  return await Software.find({'title' : new RegExp(search, 'i'),'usuario': usuario})
  .then(result => {return result})
  .catch(error => console.log(error));
};
softwareSchema.statics.findByAlumno = async function(alumnoId) {
  const Asignatura = mongoose.model('listaAsignatura');
  const asignaturas = await Asignatura.find({ listaAlumnos: alumnoId }).select('_id');
  const asignaturaIds = asignaturas.map(asignatura => asignatura._id);
  return this.find({ asignatura_id: { $in: asignaturaIds } });
};
softwareSchema.statics.findByUser = async function(userId, userRole) {
  let asignaturas = [];

  try {
      const Asignatura = mongoose.model('listaAsignatura'); // Obtener el modelo Asignatura

      let asignaturaIds = [];

      if (userRole.toLowerCase() === 'admin') {
          return await this.find().lean();
      } else if (userRole.toLowerCase() === 'profesor') {
          const asignaturasProfesor = await Asignatura.find({
              listaProfesores: userId
          }).lean();
          asignaturaIds = asignaturasProfesor.map(asignatura => asignatura._id);
      } else if (userRole.toLowerCase() === 'alumno') {
          const asignaturasAlumno = await Asignatura.find({
              listaAlumnos: userId
          }).lean();
          asignaturaIds = asignaturasAlumno.map(asignatura => asignatura._id);
      } else {
          return [];
      }

      // Buscar el software que pertenece a alguna de las asignaturas del usuario
      return await this.find({
          asignatura_id: {
              $in: asignaturaIds
          }
      }).lean();
  } catch (error) {
      console.error('Error al obtener el software:', error);
      return [];
  }
};


module.exports = mongoose.model('listaSoftware', softwareSchema);
