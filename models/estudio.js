const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EstudioSchema = new Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
});

EstudioSchema.methods.findAll = async function () {
  return await this.findAll()
    .then(result => result)
    .catch(error => console.log(error));
};

EstudioSchema.methods.findById = async function (id) {
  return await Estudio.findById(id)
    .then(result => {return result})
    .catch(error => console.log(error));
};

EstudioSchema.methods.insert= async function () {
  return await this.save()
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

EstudioSchema.methods.update = async function (id, estudio) {
  return await this.model("listaEstudio").updateOne({ _id: id }, estudio)
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

EstudioSchema.methods.delete = async function (id, estudio) {
  return await this.model("listaEstudio").deleteOne({ _id: id })
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

module.exports = mongoose.model('listaEstudio', EstudioSchema);

/* TaskSchema.methods.delete= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.deleteOne({_id: id})
  .then(result => console.log(result))
  .catch(error => console.log(error));
}; 

TaskSchema.methods.findById= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.findById(id)
  .then(result => {return result})
  .catch(error => console.log(error));
};

// Este puede valer.
TaskSchema.methods.findSearch= async function (search, usuario) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({'title' : new RegExp(search, 'i'),'usuario': usuario})
  .then(result => {return result})
  .catch(error => console.log(error));
};


module.exports = mongoose.model('listaEstudio', EstudioSchema);
*/