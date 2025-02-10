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


module.exports = mongoose.model('listaSoftware', softwareSchema);
