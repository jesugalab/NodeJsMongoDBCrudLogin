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

module.exports = mongoose.model('listaAsignatura', AsignaturaSchema);
